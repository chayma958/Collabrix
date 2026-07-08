import 'dotenv/config';
import { PrismaClient, WorkspaceRole, TaskPriority } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SALT_ROUNDS = 10;
const DEMO_PASSWORD = 'password123';

function daysFromNow(offset: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
}

const DEMO_USERS = [
  { email: 'alice@example.com', firstName: 'Alice', lastName: 'Nguyen' },
  { email: 'bob@example.com', firstName: 'Bob', lastName: 'Martinez' },
  { email: 'carol@example.com', firstName: 'Carol', lastName: 'Dubois' },
  { email: 'dave@example.com', firstName: 'Dave', lastName: 'Okafor' },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  const users = await Promise.all(
    DEMO_USERS.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: { firstName: u.firstName, lastName: u.lastName },
        create: { ...u, passwordHash, emailVerified: true },
      }),
    ),
  );
  const [alice, bob, carol, dave] = users;
  console.log(`Seeded ${users.length} demo users.`);

  const existingWorkspace = await prisma.workspace.findFirst({
    where: { name: 'Demo Workspace' },
  });
  if (existingWorkspace) {
    console.log('Demo workspace already exists, skipping demo data seed.');
    return;
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      description: 'A sample workspace pre-populated for exploring Collabrix.',
      members: {
        create: [
          { userId: alice.id, role: WorkspaceRole.OWNER },
          { userId: bob.id, role: WorkspaceRole.ADMIN },
          { userId: carol.id, role: WorkspaceRole.MEMBER },
          { userId: dave.id, role: WorkspaceRole.VIEWER },
        ],
      },
    },
  });

  const label = await prisma.label.create({
    data: { workspaceId: workspace.id, name: 'Bug', color: '#ef4444' },
  });

  const board = await prisma.board.create({
    data: { workspaceId: workspace.id, name: 'Product Launch' },
  });

  const [todo, inProgress, done] = await Promise.all([
    prisma.column.create({ data: { boardId: board.id, name: 'To Do', order: 0 } }),
    prisma.column.create({ data: { boardId: board.id, name: 'In Progress', order: 1 } }),
    prisma.column.create({ data: { boardId: board.id, name: 'Done', order: 2 } }),
  ]);

  await prisma.task.create({
    data: {
      columnId: todo.id,
      title: 'Design landing page',
      priority: TaskPriority.HIGH,
      order: 0,
      createdById: alice.id,
      dueDate: daysFromNow(5),
      assignees: { create: [{ userId: carol.id }] },
    },
  });
  await prisma.task.create({
    data: {
      columnId: todo.id,
      title: 'Fix login redirect bug',
      priority: TaskPriority.URGENT,
      order: 1,
      createdById: bob.id,
      dueDate: daysFromNow(-1),
      assignees: { create: [{ userId: dave.id }] },
      labels: { create: [{ labelId: label.id }] },
    },
  });
  await prisma.task.create({
    data: {
      columnId: inProgress.id,
      title: 'Write onboarding emails',
      priority: TaskPriority.MEDIUM,
      order: 0,
      createdById: bob.id,
      dueDate: daysFromNow(3),
      assignees: { create: [{ userId: bob.id }] },
    },
  });
  await prisma.task.create({
    data: {
      columnId: done.id,
      title: 'Set up CI pipeline',
      priority: TaskPriority.LOW,
      order: 0,
      createdById: alice.id,
      dueDate: daysFromNow(10),
      assignees: { create: [{ userId: alice.id }] },
    },
  });

  console.log('Seeded demo workspace with a board, columns, and tasks.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
