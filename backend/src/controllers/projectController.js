const prisma = require('../lib/prisma');
const { validationResult } = require('express-validator');

async function listProjects(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
    }

    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: [{ userId: req.user.id, role: 'ADMIN' }],
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });
    return res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

async function getProject(req, res, next) {
  try {
    const projectId = parseInt(req.params.id);

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.id } },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { role: 'asc' },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json({ ...project, currentUserRole: membership.role });
  } catch (err) {
    next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
    }

    const { name, description } = req.body;
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });
    return res.status(200).json(project);
  } catch (err) {
    next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    await prisma.project.delete({ where: { id: parseInt(req.params.id) } });
    return res.status(200).json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
}

async function addMember(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
    }

    const projectId = parseInt(req.params.id);
    const { email, role } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: targetUser.id } },
    });
    if (existing) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    const member = await prisma.projectMember.create({
      data: { projectId, userId: targetUser.id, role: role || 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const projectId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot remove yourself from the project' });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
    return res.status(200).json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember };
