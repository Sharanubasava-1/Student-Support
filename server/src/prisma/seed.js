import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SLA_HOURS = {
  CRITICAL: 4,
  HIGH: 8,
  MEDIUM: 24,
  LOW: 48
};

async function main() {
  console.log('🌱 Starting Database Seeding for Edumerge Support System...');

  // Clean existing tables
  await prisma.attachment.deleteMany();
  await prisma.ticketActivity.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const student1 = await prisma.user.create({
    data: {
      email: 'student@edumerge.com',
      password: defaultPassword,
      name: 'Rahul Sharma',
      role: 'STUDENT',
      department: 'Computer Science',
      phone: '+91 9876543210',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    }
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@edumerge.com',
      password: defaultPassword,
      name: 'Ananya Patel',
      role: 'STUDENT',
      department: 'Electronics & Comm',
      phone: '+91 9812345678',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    }
  });

  const staffHostel = await prisma.user.create({
    data: {
      email: 'agent.hostel@edumerge.com',
      password: defaultPassword,
      name: 'Vikram Singh',
      role: 'STAFF',
      department: 'HOSTEL',
      phone: '+91 9765432109',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
    }
  });

  const staffAcademics = await prisma.user.create({
    data: {
      email: 'agent.academics@edumerge.com',
      password: defaultPassword,
      name: 'Dr. Priya Nair',
      role: 'STAFF',
      department: 'ACADEMICS',
      phone: '+91 9654321098',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    }
  });

  const staffIT = await prisma.user.create({
    data: {
      email: 'agent.it@edumerge.com',
      password: defaultPassword,
      name: 'Rajesh Kumar',
      role: 'STAFF',
      department: 'IT',
      phone: '+91 9543210987',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@edumerge.com',
      password: defaultPassword,
      name: 'Sanjay Mehta (Support Head)',
      role: 'ADMIN',
      department: 'SUPPORT_MANAGEMENT',
      phone: '+91 9432109876',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  });

  console.log('✅ Users Created');

  // Helper date function
  const now = new Date();
  const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);
  const hoursAhead = (h) => new Date(now.getTime() + h * 60 * 60 * 1000);

  // 2. Create Sample Tickets

  // Ticket 1: CRITICAL - Hostel Water Leakage (Breached SLA)
  const ticket1Created = hoursAgo(6);
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketCode: 'TICK-1001',
      title: 'Water Leakage in Block B Room 304',
      description: 'Severe water pipe leak from room above flooding room 304. Electrical sockets nearby are wet. Urgent assistance required.',
      category: 'HOSTEL',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      slaHours: SLA_HOURS.CRITICAL,
      slaDueDate: new Date(ticket1Created.getTime() + SLA_HOURS.CRITICAL * 60 * 60 * 1000), // 4h SLA, created 6h ago -> Breached!
      isSlaBreached: true,
      studentId: student1.id,
      assignedStaffId: staffHostel.id,
      createdAt: ticket1Created,
      updatedAt: hoursAgo(1)
    }
  });

  await prisma.ticketActivity.createMany({
    data: [
      {
        ticketId: ticket1.id,
        userId: student1.id,
        action: 'CREATED',
        comment: 'Ticket created by Rahul Sharma',
        createdAt: ticket1Created
      },
      {
        ticketId: ticket1.id,
        userId: admin.id,
        action: 'ASSIGNED',
        fieldChanged: 'assignedStaffId',
        oldValue: 'Unassigned',
        newValue: 'Vikram Singh',
        comment: 'Assigned to Hostel Warden Vikram Singh',
        createdAt: hoursAgo(5)
      },
      {
        ticketId: ticket1.id,
        userId: staffHostel.id,
        action: 'STATUS_CHANGED',
        fieldChanged: 'status',
        oldValue: 'OPEN',
        newValue: 'IN_PROGRESS',
        comment: 'Plumber dispatched to inspect room 304 pipe fitting.',
        createdAt: hoursAgo(3)
      },
      {
        ticketId: ticket1.id,
        userId: staffHostel.id,
        action: 'INTERNAL_NOTE',
        comment: 'Plumber reported main valve issue. Replacement part ordered from vendor. Might exceed SLA.',
        isInternalNote: true,
        createdAt: hoursAgo(2)
      }
    ]
  });

  // Ticket 2: HIGH - Wi-Fi Portal Login Failure in Library (On Track)
  const ticket2Created = hoursAgo(2);
  const ticket2 = await prisma.ticket.create({
    data: {
      ticketCode: 'TICK-1002',
      title: 'Campus Wi-Fi Portal Authentication Error',
      description: 'Unable to login to EduMerge Wi-Fi using student LDAP credentials. Error: Invalid RADIUS token response.',
      category: 'IT',
      priority: 'HIGH',
      status: 'ASSIGNED',
      slaHours: SLA_HOURS.HIGH,
      slaDueDate: new Date(ticket2Created.getTime() + SLA_HOURS.HIGH * 60 * 60 * 1000), // 8h SLA, created 2h ago -> 6h remaining
      isSlaBreached: false,
      studentId: student1.id,
      assignedStaffId: staffIT.id,
      createdAt: ticket2Created,
      updatedAt: hoursAgo(1)
    }
  });

  await prisma.ticketActivity.createMany({
    data: [
      {
        ticketId: ticket2.id,
        userId: student1.id,
        action: 'CREATED',
        comment: 'Ticket created by Rahul Sharma',
        createdAt: ticket2Created
      },
      {
        ticketId: ticket2.id,
        userId: admin.id,
        action: 'ASSIGNED',
        fieldChanged: 'assignedStaffId',
        oldValue: 'Unassigned',
        newValue: 'Rajesh Kumar',
        comment: 'Assigned to IT Admin Rajesh Kumar',
        createdAt: hoursAgo(1)
      }
    ]
  });

  // Ticket 3: MEDIUM - Grade Correction Request Semester 4 (Open, Pending Assignment)
  const ticket3Created = hoursAgo(4);
  const ticket3 = await prisma.ticket.create({
    data: {
      ticketCode: 'TICK-1003',
      title: 'Discrepancy in Mid-Sem Internal Marks (Data Structures)',
      description: 'My internal marks for CS302 Data Structures show 18/30 instead of 26/30 as evaluated in test answer key.',
      category: 'ACADEMICS',
      priority: 'MEDIUM',
      status: 'OPEN',
      slaHours: SLA_HOURS.MEDIUM,
      slaDueDate: new Date(ticket3Created.getTime() + SLA_HOURS.MEDIUM * 60 * 60 * 1000), // 24h SLA -> 20h remaining
      isSlaBreached: false,
      studentId: student2.id,
      assignedStaffId: null,
      createdAt: ticket3Created,
      updatedAt: ticket3Created
    }
  });

  await prisma.ticketActivity.create({
    data: {
      ticketId: ticket3.id,
      userId: student2.id,
      action: 'CREATED',
      comment: 'Ticket created by Ananya Patel',
      createdAt: ticket3Created
    }
  });

  // Ticket 4: LOW - Library Access Card Renewal (Resolved)
  const ticket4Created = hoursAgo(30);
  const ticket4 = await prisma.ticket.create({
    data: {
      ticketCode: 'TICK-1004',
      title: 'Library RFID Smart Card Renewal Issue',
      description: 'Barcode on my library card is worn out and not scanning at automatic turnstile.',
      category: 'GENERAL',
      priority: 'LOW',
      status: 'RESOLVED',
      slaHours: SLA_HOURS.LOW,
      slaDueDate: new Date(ticket4Created.getTime() + SLA_HOURS.LOW * 60 * 60 * 1000),
      isSlaBreached: false,
      studentId: student2.id,
      assignedStaffId: staffAcademics.id,
      createdAt: ticket4Created,
      updatedAt: hoursAgo(5)
    }
  });

  await prisma.ticketActivity.createMany({
    data: [
      {
        ticketId: ticket4.id,
        userId: student2.id,
        action: 'CREATED',
        comment: 'Ticket created by Ananya Patel',
        createdAt: ticket4Created
      },
      {
        ticketId: ticket4.id,
        userId: staffAcademics.id,
        action: 'STATUS_CHANGED',
        fieldChanged: 'status',
        oldValue: 'IN_PROGRESS',
        newValue: 'RESOLVED',
        comment: 'New smart RFID card printed and issued at Central Library counter desk 2.',
        createdAt: hoursAgo(5)
      }
    ]
  });

  // Ticket 5: HIGH - Fee Receipt Double Deduction (Pending Student Info)
  const ticket5Created = hoursAgo(10);
  const ticket5 = await prisma.ticket.create({
    data: {
      ticketCode: 'TICK-1005',
      title: 'Fee Payment Double Deduction via Payment Gateway',
      description: 'Semester 5 fee of INR 45,000 was debited twice from bank account. Transaction IDs: TXN88921 and TXN88922.',
      category: 'FEE',
      priority: 'HIGH',
      status: 'PENDING_STUDENT_INFO',
      slaHours: SLA_HOURS.HIGH,
      slaDueDate: new Date(ticket5Created.getTime() + SLA_HOURS.HIGH * 60 * 60 * 1000),
      isSlaBreached: true,
      studentId: student1.id,
      assignedStaffId: staffAcademics.id,
      createdAt: ticket5Created,
      updatedAt: hoursAgo(2)
    }
  });

  await prisma.ticketActivity.createMany({
    data: [
      {
        ticketId: ticket5.id,
        userId: student1.id,
        action: 'CREATED',
        comment: 'Ticket created by Rahul Sharma',
        createdAt: ticket5Created
      },
      {
        ticketId: ticket5.id,
        userId: staffAcademics.id,
        action: 'STATUS_CHANGED',
        fieldChanged: 'status',
        oldValue: 'IN_PROGRESS',
        newValue: 'PENDING_STUDENT_INFO',
        comment: 'Please upload bank statement PDF showing double debit entries for verification.',
        createdAt: hoursAgo(2)
      }
    ]
  });

  console.log('✅ Demo Tickets & Activities Seeded');
  console.log('🎉 Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
