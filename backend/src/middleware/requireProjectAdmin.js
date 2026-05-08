const prisma = require('../lib/prisma');

async function requireProjectAdmin(req, res, next) {
  try {
    const projectId = parseInt(req.params.id || req.params.projectId);
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID missing' });
    }

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.id } },
    });

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Project admin access required' });
    }

    req.projectId = projectId;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireProjectAdmin;
