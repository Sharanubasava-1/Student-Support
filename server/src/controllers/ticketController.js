import prisma from '../config/prisma.js';
import { calculateSlaDueDate, updateSlaBreachStatus } from '../services/slaService.js';

/**
 * Generate sequential unique ticket code e.g. TICK-1006
 */
const generateTicketCode = async () => {
  const count = await prisma.ticket.count();
  return `TICK-${1001 + count}`;
};

/**
 * Create a new Support Ticket
 */
export const createTicket = async (req, res) => {
  try {
    const { title, description, category, priority = 'MEDIUM' } = req.body;
    const studentId = req.user.id;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    // 1. Check for duplicates (existing open tickets in same category with similar title)
    const existingOpenTickets = await prisma.ticket.findMany({
      where: {
        studentId,
        category,
        status: {
          notIn: ['RESOLVED', 'CLOSED']
        }
      }
    });

    const potentialDuplicate = existingOpenTickets.find(t =>
      t.title.toLowerCase().includes(title.toLowerCase().trim()) ||
      title.toLowerCase().includes(t.title.toLowerCase().trim())
    );

    // 2. Calculate SLA Due Date
    const { hours: slaHours, dueDate: slaDueDate } = calculateSlaDueDate(priority);
    const ticketCode = await generateTicketCode();

    // 3. Create Ticket record
    const ticket = await prisma.ticket.create({
      data: {
        ticketCode,
        title,
        description,
        category,
        priority,
        status: 'OPEN',
        slaHours,
        slaDueDate,
        studentId,
        activities: {
          create: {
            userId: studentId,
            action: 'CREATED',
            comment: `Ticket submitted by ${req.user.name}`
          }
        }
      },
      include: {
        student: { select: { id: true, name: true, email: true, department: true } },
        assignedStaff: { select: { id: true, name: true, email: true, department: true } },
        activities: true
      }
    });

    return res.status(201).json({
      message: 'Ticket created successfully',
      ticket,
      duplicateWarning: potentialDuplicate ? {
        ticketCode: potentialDuplicate.ticketCode,
        title: potentialDuplicate.title,
        status: potentialDuplicate.status
      } : null
    });
  } catch (err) {
    console.error('Error creating ticket:', err);
    return res.status(500).json({ error: 'Failed to create support ticket' });
  }
};

/**
 * Check potential duplicate tickets while typing
 */
export const checkDuplicateTickets = async (req, res) => {
  try {
    const { category, query } = req.query;
    if (!query || query.length < 3) {
      return res.json({ duplicates: [] });
    }

    const duplicates = await prisma.ticket.findMany({
      where: {
        ...(category ? { category } : {}),
        status: { notIn: ['RESOLVED', 'CLOSED'] },
        OR: [
          { title: { contains: query } },
          { description: { contains: query } }
        ]
      },
      take: 4,
      select: {
        id: true,
        ticketCode: true,
        title: true,
        category: true,
        status: true,
        priority: true,
        createdAt: true
      }
    });

    return res.json({ duplicates });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to search for duplicates' });
  }
};

/**
 * Get List of Tickets with role scoping and filters
 */
export const getTickets = async (req, res) => {
  try {
    // Perform live SLA breach check
    await updateSlaBreachStatus();

    const { category, priority, status, search, staffId, isBreached } = req.query;
    const { role, id: userId } = req.user;

    let whereClause = {};

    // Role-based restrictions
    if (role === 'STUDENT') {
      whereClause.studentId = userId;
    } else if (role === 'STAFF') {
      // Staff see tickets assigned to them OR tickets matching their department or unassigned
      if (staffId === 'mine') {
        whereClause.assignedStaffId = userId;
      } else if (staffId === 'unassigned') {
        whereClause.assignedStaffId = null;
      }
    }

    // Apply URL Query Filters
    if (category) whereClause.category = category;
    if (priority) whereClause.priority = priority;
    if (status) whereClause.status = status;
    if (isBreached === 'true') whereClause.isSlaBreached = true;
    if (isBreached === 'false') whereClause.isSlaBreached = false;

    if (search) {
      whereClause.OR = [
        { ticketCode: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        student: { select: { id: true, name: true, email: true, department: true, avatar: true } },
        assignedStaff: { select: { id: true, name: true, email: true, department: true, avatar: true } },
        _count: { select: { activities: true, attachments: true } }
      },
      orderBy: [
        { isSlaBreached: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Add dynamic remaining time calculation
    const now = new Date();
    const formattedTickets = tickets.map(t => {
      const remainingMs = new Date(t.slaDueDate).getTime() - now.getTime();
      const remainingHours = (remainingMs / (1000 * 60 * 60)).toFixed(1);

      return {
        ...t,
        remainingHours: parseFloat(remainingHours),
        isOverdue: remainingMs < 0 && !['RESOLVED', 'CLOSED'].includes(t.status)
      };
    });

    return res.json({ tickets: formattedTickets });
  } catch (err) {
    console.error('Error fetching tickets:', err);
    return res.status(500).json({ error: 'Failed to retrieve tickets list' });
  }
};

/**
 * Get Single Ticket Details by ID with full Audit Log
 */
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true, department: true, phone: true, avatar: true } },
        assignedStaff: { select: { id: true, name: true, email: true, department: true, phone: true, avatar: true } },
        attachments: true,
        activities: {
          include: {
            user: { select: { id: true, name: true, role: true, avatar: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Role security check: Student can only view their own tickets
    if (req.user.role === 'STUDENT' && ticket.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this ticket' });
    }

    // Hide internal notes from Student users
    let filteredActivities = ticket.activities;
    if (req.user.role === 'STUDENT') {
      filteredActivities = ticket.activities.filter(a => !a.isInternalNote);
    }

    const now = new Date();
    const remainingMs = new Date(ticket.slaDueDate).getTime() - now.getTime();
    const remainingHours = (remainingMs / (1000 * 60 * 60)).toFixed(1);

    return res.json({
      ticket: {
        ...ticket,
        activities: filteredActivities,
        remainingHours: parseFloat(remainingHours),
        isOverdue: remainingMs < 0 && !['RESOLVED', 'CLOSED'].includes(ticket.status)
      }
    });
  } catch (err) {
    console.error('Error fetching ticket details:', err);
    return res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
};

/**
 * Update Ticket Status
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_STUDENT_INFO', 'RESOLVED', 'CLOSED'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid ticket status transition' });
    }

    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Ticket not found' });

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        student: true,
        assignedStaff: true
      }
    });

    // Record activity log
    await prisma.ticketActivity.create({
      data: {
        ticketId: id,
        userId: req.user.id,
        action: 'STATUS_CHANGED',
        fieldChanged: 'status',
        oldValue: existing.status,
        newValue: status,
        comment: `Status updated from ${existing.status} to ${status}`
      }
    });

    return res.json({ message: 'Ticket status updated', ticket: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update ticket status' });
  }
};

/**
 * Assign Staff to Ticket
 */
export const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    const staffUser = staffId ? await prisma.user.findUnique({ where: { id: staffId } }) : null;
    const existing = await prisma.ticket.findUnique({
      where: { id },
      include: { assignedStaff: true }
    });

    if (!existing) return res.status(404).json({ error: 'Ticket not found' });

    const newStatus = existing.status === 'OPEN' && staffId ? 'ASSIGNED' : existing.status;

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        assignedStaffId: staffId || null,
        status: newStatus
      },
      include: {
        assignedStaff: { select: { id: true, name: true, email: true, department: true } }
      }
    });

    // Record activity log
    await prisma.ticketActivity.create({
      data: {
        ticketId: id,
        userId: req.user.id,
        action: 'ASSIGNED',
        fieldChanged: 'assignedStaffId',
        oldValue: existing.assignedStaff ? existing.assignedStaff.name : 'Unassigned',
        newValue: staffUser ? staffUser.name : 'Unassigned',
        comment: staffUser ? `Assigned to staff member ${staffUser.name}` : 'Unassigned staff member'
      }
    });

    return res.json({ message: 'Ticket assigned successfully', ticket: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to assign ticket' });
  }
};

/**
 * Update Priority & Recalculate SLA
 */
export const updateTicketPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority level' });
    }

    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Ticket not found' });

    const { hours: slaHours, dueDate: slaDueDate } = calculateSlaDueDate(priority, existing.createdAt);

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        priority,
        slaHours,
        slaDueDate,
        isSlaBreached: new Date() > slaDueDate
      }
    });

    await prisma.ticketActivity.create({
      data: {
        ticketId: id,
        userId: req.user.id,
        action: 'PRIORITY_CHANGED',
        fieldChanged: 'priority',
        oldValue: existing.priority,
        newValue: priority,
        comment: `Priority updated to ${priority}. SLA adjusted to ${slaHours} hours target.`
      }
    });

    return res.json({ message: 'Priority updated', ticket: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update priority' });
  }
};

/**
 * Add Comment or Internal Note
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, isInternalNote = false } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    // Only staff & admin can create internal notes
    const canInternal = ['STAFF', 'ADMIN'].includes(req.user.role);
    const internal = canInternal ? Boolean(isInternalNote) : false;

    const activity = await prisma.ticketActivity.create({
      data: {
        ticketId: id,
        userId: req.user.id,
        action: internal ? 'INTERNAL_NOTE' : 'COMMENT',
        comment: comment.trim(),
        isInternalNote: internal
      },
      include: {
        user: { select: { id: true, name: true, role: true, avatar: true } }
      }
    });

    return res.status(201).json({ message: 'Comment added', activity });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to post comment' });
  }
};

/**
 * Delete an accidental ticket before support work begins
 */
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { studentId: true, status: true, assignedStaffId: true }
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (req.user.role !== 'STUDENT' || ticket.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Only the ticket owner can delete this ticket' });
    }

    if (ticket.status !== 'OPEN' || ticket.assignedStaffId) {
      return res.status(400).json({ error: 'Only unassigned OPEN tickets can be deleted' });
    }

    await prisma.ticket.delete({ where: { id } });

    return res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error('Error deleting ticket:', err);
    return res.status(500).json({ error: 'Failed to delete ticket' });
  }
};

/**
 * Reopen Resolved Ticket (Student option)
 */
export const reopenTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (ticket.status !== 'RESOLVED') {
      return res.status(400).json({ error: 'Only tickets in RESOLVED status can be reopened' });
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        updatedAt: new Date()
      }
    });

    await prisma.ticketActivity.create({
      data: {
        ticketId: id,
        userId: req.user.id,
        action: 'REOPENED',
        fieldChanged: 'status',
        oldValue: 'RESOLVED',
        newValue: 'IN_PROGRESS',
        comment: reason ? `Ticket reopened by student. Reason: ${reason}` : 'Ticket reopened by student due to unresolved issue.'
      }
    });

    return res.json({ message: 'Ticket reopened successfully', ticket: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reopen ticket' });
  }
};
