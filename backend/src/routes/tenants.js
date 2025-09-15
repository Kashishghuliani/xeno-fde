const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Tenant } = require('../models');

// List all tenants (for admin/debugging)
router.get('/', auth, async (req, res) => {
  try {
    const tenants = await Tenant.findAll();
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single tenant by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
