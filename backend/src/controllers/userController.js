const prisma = require('../lib/prisma');

async function listUsers(req, res, next) {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers };
