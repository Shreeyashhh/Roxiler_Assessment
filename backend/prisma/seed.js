const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with sample records...');

  // Password for all seeded users: Password123!
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed System Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'System Administrator Account',
      email: 'admin@example.com',
      passwordHash: defaultPasswordHash,
      address: '100 Admin Plaza, Central Hub, Suite 500',
      role: 'SYSTEM_ADMIN'
    }
  });
  console.log(`Created Admin: ${admin.email}`);

  // 2. Seed Store Owners
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@example.com' },
    update: {},
    create: {
      name: 'Alexander Graham Bell Owner',
      email: 'owner1@example.com',
      passwordHash: defaultPasswordHash,
      address: '250 Enterprise Avenue, Business District, Metro City',
      role: 'STORE_OWNER'
    }
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@example.com' },
    update: {},
    create: {
      name: 'Victoria Beckham Store Owner',
      email: 'owner2@example.com',
      passwordHash: defaultPasswordHash,
      address: '450 Commerce Boulevard, Industrial Park, Metro City',
      role: 'STORE_OWNER'
    }
  });
  console.log(`Created Store Owners: ${owner1.email}, ${owner2.email}`);

  // 3. Seed Normal Users
  const normalUsersData = [
    {
      name: 'Jonathan Edward Star User',
      email: 'user1@example.com',
      address: '12 Maple Street, Suburbia, Metro City'
    },
    {
      name: 'Elizabeth Grace Bennett User',
      email: 'user2@example.com',
      address: '45 Oak Avenue, Suburbia, Metro City'
    },
    {
      name: 'Christopher Robin Milne User',
      email: 'user3@example.com',
      address: '78 Pine Road, Suburbia, Metro City'
    },
    {
      name: 'Samantha Jane Miller User',
      email: 'user4@example.com',
      address: '101 Elm Drive, Suburbia, Metro City'
    },
    {
      name: 'Benjamin Franklin Cooper User',
      email: 'user5@example.com',
      address: '202 Cedar Lane, Suburbia, Metro City'
    }
  ];

  const normalUsers = [];
  for (const u of normalUsersData) {
    const createdUser = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash: defaultPasswordHash,
        address: u.address,
        role: 'NORMAL_USER'
      }
    });
    normalUsers.push(createdUser);
  }
  console.log(`Created ${normalUsers.length} Normal Users.`);

  // 4. Seed Stores
  const storesData = [
    {
      name: 'TechHub Electronics Store',
      email: 'contact@techhub.com',
      address: '101 Tech Street, Silicon Valley',
      ownerId: owner1.id
    },
    {
      name: 'Urban Fresh Supermarket',
      email: 'info@urbanfresh.com',
      address: '55 Organic Way, Downtown',
      ownerId: owner1.id
    },
    {
      name: 'Gourmet Coffee Roasters',
      email: 'hello@gourmetcoffee.com',
      address: '12 Espresso Lane, Arts District',
      ownerId: owner2.id
    },
    {
      name: 'Apex Fitness Center Store',
      email: 'support@apexfitness.com',
      address: '88 Sports Boulevard, Midtown',
      ownerId: owner2.id
    },
    {
      name: 'Bookworm Paradise Bookstore',
      email: 'books@bookworm.com',
      address: '303 Reading Avenue, Campus Zone',
      ownerId: owner2.id
    }
  ];

  const stores = [];
  for (const s of storesData) {
    const store = await prisma.store.upsert({
      where: { email: s.email },
      update: {},
      create: s
    });
    stores.push(store);
  }
  console.log(`Created ${stores.length} Stores.`);

  // 5. Seed Ratings
  const ratingsSample = [
    { userId: normalUsers[0].id, storeId: stores[0].id, rating: 5 },
    { userId: normalUsers[1].id, storeId: stores[0].id, rating: 4 },
    { userId: normalUsers[2].id, storeId: stores[0].id, rating: 5 },
    { userId: normalUsers[0].id, storeId: stores[1].id, rating: 4 },
    { userId: normalUsers[3].id, storeId: stores[1].id, rating: 3 },
    { userId: normalUsers[1].id, storeId: stores[2].id, rating: 5 },
    { userId: normalUsers[2].id, storeId: stores[2].id, rating: 4 },
    { userId: normalUsers[4].id, storeId: stores[2].id, rating: 5 },
    { userId: normalUsers[3].id, storeId: stores[3].id, rating: 4 },
    { userId: normalUsers[4].id, storeId: stores[4].id, rating: 5 }
  ];

  for (const r of ratingsSample) {
    await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: r.userId,
          storeId: r.storeId
        }
      },
      update: { rating: r.rating },
      create: r
    });
  }
  console.log(`Seeded ${ratingsSample.length} Ratings.`);
  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
