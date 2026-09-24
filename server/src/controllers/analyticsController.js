import prisma from '../config/prisma.js';
import { updateSlaBreachStatus } from '../services/slaService.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    await updateSlaBreachStatus();

    // 1. Core Summary Metrics
    const totalTickets = await prisma.ticket.count();
    const openTickets = await prisma.ticket.count({ where: { status: 'OPEN' } });
    const inProgressTickets = await prisma.ticket.count({ where: { status: 'IN_PROGRESS' } });
    const pendingStudentTickets = await prisma.ticket.count({ where: { status: 'PENDING_STUDENT_INFO' } });
    const resolvedTickets = await prisma.ticket.count({ where: { status: 'RESOLVED' } });
    const slaBreachedTickets = await prisma.ticket.count({ where: { isSlaBreached: true } });

    const slaComplianceRate = totalTickets > 0
      ? (((totalTickets - slaBreachedTickets) / totalTickets) * 100).toFixed(1)
      : 100;

    // 2. Category Distribution
    const categories = ['ACADEMICS', 'HOSTEL', 'TRANSPORT', 'FEE', 'IT', 'GENERAL'];
    const categoryStats = await Promise.all(
      categories.map(async (cat) => ({
        category: cat,
        count: await prisma.ticket.count({ where: { category: cat } })
      }))
    );

    // 3. Priority Distribution
    const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const priorityStats = await Promise.all(
      priorities.map(async (p) => ({
        priority: p,
        count: await prisma.ticket.count({ where: { priority: p } })
      }))
    );

    // 4. Staff Workload & Performance
    const staffMembers = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: { id: true, name: true, department: true, avatar: true }
    });

    const staffWorkload = await Promise.all(
      staffMembers.map(async (staff) => {
        const assignedCount = await prisma.ticket.count({ where: { assignedStaffId: staff.id } });
        const activeCount = await prisma.ticket.count({
          where: {
            assignedStaffId: staff.id,
            status: { in: ['ASSIGNED', 'IN_PROGRESS', 'PENDING_STUDENT_INFO'] }
          }
        });
        const resolvedCount = await prisma.ticket.count({
          where: {
            assignedStaffId: staff.id,
            status: { in: ['RESOLVED', 'CLOSED'] }
          }
        });
        const breachedCount = await prisma.ticket.count({
          where: {
            assignedStaffId: staff.id,
            isSlaBreached: true
          }
        });

        return {
          ...staff,
          assignedCount,
          activeCount,
          resolvedCount,
          breachedCount
        };
      })
    );

    return res.json({
      summary: {
        totalTickets,
        openTickets,
        inProgressTickets,
        pendingStudentTickets,
        resolvedTickets,
        slaBreachedTickets,
        slaComplianceRate: parseFloat(slaComplianceRate)
      },
      categoryStats,
      priorityStats,
      staffWorkload
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    return res.status(500).json({ error: 'Failed to generate analytics report' });
  }
};
