const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function userSafe(user) {
  const { password, ...safe } = user;
  return safe;
}

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
    }

    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(422).json({ errors: [{ field: 'email', message: 'Email already in use' }] });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return res.status(201).json({ user: userSafe(user), token: makeToken(user.id) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
    }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ user: userSafe(user), token: makeToken(user.id) });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  return res.status(200).json({ message: 'Logged out' });
}

function me(req, res) {
  return res.status(200).json(req.user);
}

module.exports = { register, login, logout, me };
