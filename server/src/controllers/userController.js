import prisma from '../config/prisma.js';

export const getSupportStaff = async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['STAFF', 'ADMIN'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        avatar: true
      },
      orderBy: { name: 'asc' }
    });

    return res.json({ staff });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch support staff list' });
  }
};
