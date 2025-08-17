const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const user1 = await prisma.user.upsert({
    where: { email: 'demo@tomoboard.com' },
    update: {},
    create: {
      email: 'demo@tomoboard.com',
      username: 'demo_user',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      isActive: true
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@tomoboard.com' },
    update: {},
    create: {
      email: 'admin@tomoboard.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true
    }
  });

  console.log('👥 Created users:', { user1: user1.email, user2: user2.email });

  // Create sample whiteboards
  const whiteboard1 = await prisma.whiteboard.create({
    data: {
      title: 'Welcome to TomoBoard',
      description: 'A collaborative whiteboard for your team',
      isPublic: true,
      ownerId: user1.id,
      canvasData: {
        version: '5.3.0',
        objects: [
          {
            type: 'textbox',
            version: '5.3.0',
            originX: 'left',
            originY: 'top',
            left: 100,
            top: 100,
            width: 400,
            height: 50,
            fill: '#ec4899',
            stroke: null,
            text: 'Welcome to TomoBoard! 🌸',
            fontSize: 24,
            fontWeight: 'bold',
            fontFamily: 'Arial'
          }
        ]
      },
      settings: {
        backgroundColor: '#ffffff',
        grid: true,
        gridSize: 20,
        zoom: 1
      }
    }
  });

  const whiteboard2 = await prisma.whiteboard.create({
    data: {
      title: 'Project Planning Board',
      description: 'Planning our next big project',
      isPublic: false,
      ownerId: user2.id,
      canvasData: {
        version: '5.3.0',
        objects: []
      },
      settings: {
        backgroundColor: '#f9fafb',
        grid: true,
        gridSize: 25,
        zoom: 1
      }
    }
  });

  console.log('📋 Created whiteboards:', { 
    whiteboard1: whiteboard1.title, 
    whiteboard2: whiteboard2.title 
  });

  // Add collaborators
  await prisma.whiteboardCollaborator.create({
    data: {
      userId: user2.id,
      whiteboardId: whiteboard1.id,
      role: 'EDITOR',
      permissions: ['CAN_EDIT', 'CAN_COMMENT']
    }
  });

  await prisma.whiteboardCollaborator.create({
    data: {
      userId: user1.id,
      whiteboardId: whiteboard2.id,
      role: 'VIEWER',
      permissions: ['CAN_COMMENT']
    }
  });

  console.log('🤝 Added collaborators');

  // Add sample chat messages
  await prisma.chatMessage.create({
    data: {
      content: 'Welcome to the whiteboard! Feel free to start collaborating.',
      type: 'SYSTEM',
      userId: user1.id,
      whiteboardId: whiteboard1.id
    }
  });

  await prisma.chatMessage.create({
    data: {
      content: 'This looks great! Let\'s start adding some ideas.',
      type: 'TEXT',
      userId: user2.id,
      whiteboardId: whiteboard1.id
    }
  });

  console.log('💬 Added sample chat messages');
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
