import prisma from '../config/prisma.js';

export const SLA_MATRIX = {
  CRITICAL: 4,  // 4 Hours
  HIGH: 8,      // 8 Hours
  MEDIUM: 24,   // 24 Hours
  LOW: 48       // 48 Hours
};

export const calculateSlaDueDate = (priority, startDate = new Date()) => {
  const hours = SLA_MATRIX[priority] || 24;
  return {
    hours,
    dueDate: new Date(startDate.getTime() + hours * 60 * 60 * 1000)
  };
};

/**
 * Checks all active tickets and updates SLA breach statuses
 */
export const updateSlaBreachStatus = async () => {
  try {
    const now = new Date();
    const activeTickets = await prisma.ticket.findMany({
      where: {
        status: {
          notIn: ['RESOLVED', 'CLOSED']
        },
        isSlaBreached: false,
        slaDueDate: {
          lt: now
        }
      }
    });

    for (const ticket of activeTickets) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { isSlaBreached: true }
      });

      // Add activity log for SLA breach event
      await prisma.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          userId: ticket.studentId, // system log
          action: 'SLA_BREACHED',
          comment: `SLA breach trigger: Ticket exceeded maximum target response time of ${ticket.slaHours} hours.`,
          isInternalNote: true
        }
      });
    }
  } catch (err) {
    console.error('Error updating SLA breach status:', err);
  }
};
