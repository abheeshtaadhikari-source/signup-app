const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 12;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72; // bcrypt only uses the first 72 bytes

// Validate and normalise the email/password from a request body
function validateCredentials(body) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email) return { error: 'Email is required.' };
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return { error: 'Enter a valid email address.' };
  }
  if (!password) return { error: 'Password is required.' };

  return { value: { email, password } };
}

// ---- SIGN UP ----
// POST /api/auth/signup  { email, password }
router.post('/signup', async (req, res, next) => {
  try {
    const { error, value } = validateCredentials(req.body || {});
    if (error) return res.status(400).json({ error });

    if (value.password.length < MIN_PASSWORD) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD} characters.` });
    }
    if (value.password.length > MAX_PASSWORD) {
      return res.status(400).json({ error: `Password must be ${MAX_PASSWORD} characters or fewer.` });
    }

    const exists = await User.exists({ email: value.email });
    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(value.password, SALT_ROUNDS);
    const user = await User.create({ email: value.email, password: hash });

    res.status(201).json({ message: 'Account created.', user });
  } catch (err) {
    // Race condition: two sign-ups with the same email at once
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    next(err);
  }
});

// ---- LOG IN ----
// POST /api/auth/login  { email, password }
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = validateCredentials(req.body || {});
    if (error) return res.status(400).json({ error });

    const user = await User.findOne({ email: value.email }).select('+password');
    const passwordOk = user && (await bcrypt.compare(value.password, user.password));

    if (!passwordOk) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({ message: 'Logged in.', user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
