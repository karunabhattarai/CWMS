// tests/userRoutes.test.js
import request from 'supertest';
import app from '../server.js'; // make sure your app is exported from server.js

let token; // will store auth token for reuse
let userId; // store a user id to fetch, update, delete

describe('User API Endpoints', () => {
  const testEmail = `superadmin${Date.now()}@example.com`;

  it('should register a new SuperAdmin', async () => {
    const res = await request(app).post('/api/user/register/superadmin').send({
      name: 'Test Superadmin',
      email: testEmail,
      password: 'test1234'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/SuperAdmin registered successfully/i);
  });

  it('should fail login until email is verified', async () => {
    const res = await request(app).post('/api/user/login').send({
      email: testEmail,
      password: 'test1234'
    });
    expect(res.statusCode).toBe(403);
  });

  it('should simulate email verification', async () => {
    const user = await (await import('../models/User.js')).default.findOne({ email: testEmail });
    const res = await request(app).get(`/api/user/verify-email?token=${user.verificationToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Email verified successfully/i);
  });

  it('should login the SuperAdmin after verification', async () => {
    const res = await request(app).post('/api/user/login').send({
      email: testEmail,
      password: 'test1234'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
    userId = res.body.user._id;
  });

  it('should fetch all users with token', async () => {
    const res = await request(app)
      .get('/api/user/all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should fetch user by ID', async () => {
    const res = await request(app)
      .get(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(userId);
  });

  it('should update user info', async () => {
    const res = await request(app)
      .put(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Admin' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Admin');
  });

  it('should change password', async () => {
    const res = await request(app)
      .post('/api/user/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        oldPassword: 'test1234',
        newPassword: 'newpass123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Password changed successfully/i);
  });

  it('should request password reset', async () => {
    const res = await request(app)
      .post('/api/user/request-password-reset')
      .send({ email: testEmail });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/reset link has been sent/i);
  });

  it('should simulate password reset', async () => {
    const user = await (await import('../models/User.js')).default.findOne({ email: testEmail });
    const res = await request(app)
      .post('/api/user/reset-password')
      .send({
        token: user.resetPasswordToken,
        newPassword: 'finalpass123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Password has been reset/i);
  });

  it('should delete user (SuperAdmin only)', async () => {
    const res = await request(app)
      .delete(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });
});
