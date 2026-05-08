const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('password123', 12);
  const memberPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@demo.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@demo.com' },
    update: {},
    create: {
      name: 'Member User',
      email: 'member@demo.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Demo Project',
      description: 'A sample project to showcase the task manager features.',
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const now = new Date();
  const past = (days) => new Date(now.getTime() - days * 86400000);
  const future = (days) => new Date(now.getTime() + days * 86400000);

  await prisma.task.createMany({
    data: [
      {
        title: 'Set up project repository',
        description: 'Initialize git repo and configure CI pipeline.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: past(10),
        projectId: project.id,
        creatorId: admin.id,
        assigneeId: admin.id,
      },
      {
        title: 'Design database schema',
        description: 'Define all models and relations in Prisma.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: past(5),
        projectId: project.id,
        creatorId: admin.id,
        assigneeId: admin.id,
      },
      {
        title: 'Implement authentication',
        description: 'JWT-based login and registration with httpOnly cookies.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: past(2),
        projectId: project.id,
        creatorId: admin.id,
        assigneeId: member.id,
      },
      {
        title: 'Build task list UI',
        description: 'Create the task table with filters and inline status updates.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: future(3),
        projectId: project.id,
        creatorId: admin.id,
        assigneeId: member.id,
      },
      {
        title: 'Write deployment documentation',
        description: 'Document Railway deployment steps in the README.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: future(7),
        projectId: project.id,
        creatorId: admin.id,
        assigneeId: null,
      },
    ],
  });

  console.log('Seed complete.');
  console.log('  admin@demo.com  / password123');
  console.log('  member@demo.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
