const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const config = require('../src/config');
const prisma = require('../src/prisma');

// Mock Prisma
jest.mock('../src/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  store: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  rating: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}));

describe('Store Rating API Test Suite', () => {
  let adminToken, normalUserToken, storeOwnerToken;
  const adminId = 1;
  const normalUserId = 2;
  const storeOwnerId = 3;

  beforeAll(() => {
    adminToken = jwt.sign(
      { userId: adminId, role: 'SYSTEM_ADMIN', email: 'admin@example.com', name: 'System Administrator Account' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    normalUserToken = jwt.sign(
      { userId: normalUserId, role: 'NORMAL_USER', email: 'user1@example.com', name: 'Jonathan Edward Star User' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    storeOwnerToken = jwt.sign(
      { userId: storeOwnerId, role: 'STORE_OWNER', email: 'owner1@example.com', name: 'Alexander Graham Bell Owner' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health should return 200 OK', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('2. Authentication APIs', () => {
    it('POST /api/auth/register should successfully register a Normal User', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 10,
        name: 'Jonathan Edward Star User',
        email: 'newuser@example.com',
        address: '100 New Street, Metro City',
        role: 'NORMAL_USER',
        createdAt: new Date().toISOString()
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jonathan Edward Star User',
          email: 'newuser@example.com',
          address: '100 New Street, Metro City',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('newuser@example.com');
    });

    it('POST /api/auth/register should fail validation when name is under 20 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Name',
          email: 'short@example.com',
          address: '100 New Street, Metro City',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toContain('Name must be between 20 and 60 characters.');
    });

    it('POST /api/auth/register should fail validation when password lacks uppercase/special character', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jonathan Edward Star User',
          email: 'invalidpass@example.com',
          address: '100 New Street, Metro City',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(res.status).toBe(422);
      expect(res.body.errors[0]).toMatch(/Password must be 8-16 characters/);
    });

    it('POST /api/auth/login should authenticate valid credentials and return JWT', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: normalUserId,
        name: 'Jonathan Edward Star User',
        email: 'user1@example.com',
        passwordHash: hashedPassword,
        address: '12 Maple Street',
        role: 'NORMAL_USER'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user1@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('NORMAL_USER');
    });

    it('POST /api/auth/login should reject invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword1!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Role-Based Authorization Enforcement', () => {
    it('GET /api/users should allow SYSTEM_ADMIN', async () => {
      prisma.user.count.mockResolvedValue(1);
      prisma.user.findMany.mockResolvedValue([
        { id: 1, name: 'System Administrator Account', email: 'admin@example.com', role: 'SYSTEM_ADMIN' }
      ]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBe(1);
    });

    it('GET /api/users should deny NORMAL_USER with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/users without JWT token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });
  });

  describe('4. Store Management & Calculations', () => {
    it('GET /api/stores should calculate correct average rating and myRating', async () => {
      prisma.store.count.mockResolvedValue(1);
      prisma.store.findMany.mockResolvedValue([
        {
          id: 100,
          name: 'TechHub Electronics Store',
          email: 'contact@techhub.com',
          address: '101 Tech Street',
          ownerId: storeOwnerId,
          owner: { id: storeOwnerId, name: 'Alexander Graham Bell Owner', email: 'owner1@example.com' },
          ratings: [
            { id: 1, rating: 5, userId: normalUserId },
            { id: 2, rating: 3, userId: 99 }
          ]
        }
      ]);

      const res = await request(app)
        .get('/api/stores')
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.stores[0].overallRating).toBe(4);
      expect(res.body.data.stores[0].myRating).toBe(5);
    });

    it('POST /api/stores by Admin should create a new store', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: storeOwnerId, role: 'STORE_OWNER' });
      prisma.store.findUnique.mockResolvedValue(null);
      prisma.store.create.mockResolvedValue({
        id: 101,
        name: 'New Superstore Outlet',
        email: 'newsuperstore@example.com',
        address: '500 Retail Plaza',
        ownerId: storeOwnerId,
        owner: { id: storeOwnerId, name: 'Alexander Graham Bell Owner', email: 'owner1@example.com' }
      });

      const res = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Superstore Outlet',
          email: 'newsuperstore@example.com',
          address: '500 Retail Plaza',
          ownerId: storeOwnerId
        });

      expect(res.status).toBe(201);
      expect(res.body.data.store.name).toBe('New Superstore Outlet');
    });
  });

  describe('5. Ratings & Duplicate Prevention', () => {
    it('POST /api/ratings should allow NORMAL_USER to rate a store', async () => {
      prisma.store.findUnique.mockResolvedValue({ id: 100, name: 'TechHub Electronics Store' });
      prisma.rating.findUnique.mockResolvedValue(null);
      prisma.rating.create.mockResolvedValue({
        id: 50,
        userId: normalUserId,
        storeId: 100,
        rating: 5
      });

      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({ storeId: 100, rating: 5 });

      expect(res.status).toBe(201);
      expect(res.body.data.rating.rating).toBe(5);
    });

    it('POST /api/ratings should prevent duplicate rating submission with 409 Conflict', async () => {
      prisma.store.findUnique.mockResolvedValue({ id: 100, name: 'TechHub Electronics Store' });
      prisma.rating.findUnique.mockResolvedValue({
        id: 50,
        userId: normalUserId,
        storeId: 100,
        rating: 5
      });

      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({ storeId: 100, rating: 4 });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already submitted a rating/i);
    });

    it('PUT /api/ratings/:id should update existing rating', async () => {
      prisma.rating.findUnique.mockResolvedValue({
        id: 50,
        userId: normalUserId,
        storeId: 100,
        rating: 4
      });
      prisma.rating.update.mockResolvedValue({
        id: 50,
        userId: normalUserId,
        storeId: 100,
        rating: 5
      });

      const res = await request(app)
        .put('/api/ratings/50')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({ rating: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.rating.rating).toBe(5);
    });
  });

  describe('6. Password Update', () => {
    it('PUT /api/users/:id/password should update password when current password is correct', async () => {
      const currentPasswordHash = await bcrypt.hash('CurrentPass1!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: normalUserId,
        passwordHash: currentPasswordHash
      });
      prisma.user.update.mockResolvedValue({ id: normalUserId });

      const res = await request(app)
        .put(`/api/users/${normalUserId}/password`)
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({
          currentPassword: 'CurrentPass1!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('PUT /api/users/:id/password should reject incorrect current password', async () => {
      const currentPasswordHash = await bcrypt.hash('CurrentPass1!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: normalUserId,
        passwordHash: currentPasswordHash
      });

      const res = await request(app)
        .put(`/api/users/${normalUserId}/password`)
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({
          currentPassword: 'WrongCurrentPass!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Current password is incorrect/i);
    });
  });
});
