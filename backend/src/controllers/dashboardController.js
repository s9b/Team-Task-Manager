const prisma = require('../lib/prisma');

async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const now = new Date();

    const userProjects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    const projectIds = userProjects.map((m) => m.projectId);

    const [
      totalProjects,
      totalTasks,
      todoCount,
      inProgressCount,
      doneCount,
      overdueTasks,
      recentTasks,
    ] = await Promise.all([
      prisma.project.count({ where: { id: { in: projectIds } } }),
      prisma.task.count({ where: { projectId: { in: projectIds } } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'TODO' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
      prisma.task.findMany({
        where: {
          projectId: { in: projectIds },
          dueDate: { lt: now },
          status: { not: 'DONE' },
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
        },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.task.findMany({
        where: { assigneeId: userId },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return res.status(200).json({
      totalProjects,
      totalTasks,
      tasksByStatus: { todo: todoCount, in_progress: inProgressCount, done: doneCount },
      overdueTasks,
      recentTasks,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
