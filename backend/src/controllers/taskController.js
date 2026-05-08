const prisma = require('../lib/prisma');
const { validationResult } = require('express-validator');

async function createTask(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
    }

    const { title, description, status, priority, dueDate, assigneeId, projectId } = req.body;

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: parseInt(projectId), userId: req.user.id } },
    });
    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }
    if (membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only project admins can create tasks' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        projectId: parseInt(projectId),
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        creatorId: req.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
    return res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function getMyTasks(req, res, next) {
  try {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: req.user.id },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}

async function getProjectTasks(req, res, next) {
  try {
    const projectId = parseInt(req.params.projectId);

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.id } },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
    }

    const taskId = parseInt(req.params.id);
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    if (membership.role === 'MEMBER') {
      if (task.assigneeId !== req.user.id) {
        return res.status(403).json({ error: 'Members can only update their own assigned tasks' });
      }
      const updated = await prisma.task.update({
        where: { id: taskId },
        data: { status },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
      });
      return res.status(200).json(updated);
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : dueDate === null ? null : undefined,
        assigneeId: assigneeId !== undefined ? (assigneeId ? parseInt(assigneeId) : null) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id);
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
    });
    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Project admin access required' });
    }

    await prisma.task.delete({ where: { id: taskId } });
    return res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTask, getMyTasks, getProjectTasks, updateTask, deleteTask };
