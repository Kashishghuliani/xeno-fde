const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { manualSync } = require('../controllers/tenantcontroller');

// Trigger a manual sync
router.post('/all', authMiddleware, async (req, res) => {
  try {
    await manualSync(req.user.tenantId);
    res.json({ ok: true, message: 'Data synced!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

module.exports = router;
