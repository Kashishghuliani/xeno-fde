// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Tenant } = require('../models'); // make sure these are correctly imported
const router = express.Router();

// ===== Register =====
router.post('/register', async (req, res) => {
  const { email, password, tenantName } = req.body;

  if (!email || !password || !tenantName) {
    return res.status(400).json({ error: 'Email, password and tenant name required' });
  }

  try {
    // Create Tenant
    const tenant = await Tenant.create({ name: tenantName });

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create User as admin
    const user = await User.create({
      email,
      password_hash: hash,
      tenant_id: tenant.id,
      is_admin: true,
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, tenantId: tenant.id },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, tenantId: tenant.id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ===== Login =====
// ===== Login =====
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // 1️⃣ Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`[LOGIN] User not found for email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log(`[LOGIN] Found user:`, user.email, `tenant_id: ${user.tenant_id}`);

    // 2️⃣ Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log(`[LOGIN] Password valid?`, isValid);

    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '7d' }
    );

    console.log(`[LOGIN] Successful login for ${email}`);
    res.json({ token, tenantId: user.tenant_id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});


module.exports = router;
