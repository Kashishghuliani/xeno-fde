const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const { manualSync } = require('../controllers/ingestController');

router.post('/sync', auth, tenantMiddleware, async (req, res) => {
  try {
    await manualSync(req.tenantId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
