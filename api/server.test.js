// Write your tests here
const db = require('../data/dbConfig');
const request = require('supertest');
const server = require('./server');

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db('users').truncate()
})
afterAll(async () => {
  await db.destroy()
})

jest.setTimeout(7500)
// how to reset db after each test?

describe('[POST] /api/auth/register', () => {
  const newUser = { username: 'Captain Marvel', password: 'foobar' }
  test('resolves to a payload that has an id, username, and hashed password', async () => {
    const res = await request(server).post('/api/auth/register').send(newUser)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('username')
    expect(res.body).toHaveProperty('password')
  })
  test('responds with correct message when username or password is missing', async () => {
    const missingCredentials = { username: 'foobarbazz' }
    const res = await request(server).post('/api/auth/register').send(missingCredentials)
    expect(res.status).toBe(400)
    expect(res.text).toMatch('username and password required')
  })
  test('responds with correct message when username already exists', async () => {
    await request(server).post('/api/auth/register').send(newUser)
    const res = await request(server).post('/api/auth/register').send(newUser)
    expect(res.status).toBe(400)
    expect(res.text).toMatch('username taken')
  })
})

describe('[POST] /api/auth/login', () => {
  const user = { username: 'foobar', password: 'foobarbazz' }
  // const missingUsername = { password: 'foobar' }
  const missingPassword = { username: 'Captain Marvel' }
  const invalid = { username: 'Captain America', password: 'foobar' }
  test('on successful login, the response body should have message and token', async () => {
    await request(server).post('/api/auth/register').send(user)
    const res = await request(server).post('/api/auth/login').send(user)
    expect(res.body).toHaveProperty('message')
    expect(res.body).toHaveProperty('token')
  })
  test('on failed login due to the missing username or password, response should have correct message', async () => {
    const message = 'username and password required'
    // let res = await request(server).post('/api/auth/login').send(missingUsername)
    // expect(res.text).toMatch(message)
    const res = await request(server).post('/api/auth/login').send(missingPassword)
    expect(res.text).toMatch(message)
  })
  test('on failed login due to incorrect credentials, response should have correct message', async () => {
    const message = 'invalid credentials'
    const res = await request(server).post('/api/auth/login').send(invalid)
    expect(res.text).toMatch(message)
  })
})

describe('[GET] /api/jokes', () => {
  test('cannot get access to jokes without token', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.text).toMatch(/token required/i)
  })
  test('cannot access jokes without valid token', async () => {
    const res = await request(server).get('/api/jokes').set('Authorization', 'foobar')
    expect(res.text).toMatch(/token invalid/i)
  })
  test('can retrieve jokes with valid token', async () => {
    const login = { username: 'Captain Marvel', password: 'foobar' }
    await request(server).post('/api/auth/register').send(login)
    let res = await request(server).post('/api/auth/login').send(login)
    res = await request(server).get('/api/jokes').send('Authorization', res.body.token)
    expect(res.body).toBeDefined()
  })
})