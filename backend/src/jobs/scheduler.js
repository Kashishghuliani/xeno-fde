const cron = require('node-cron');
const { Tenant } = require('../models');
const { manualSync } = require('../controllers/ingestController');

// every 10 minutes (for demo you can run every minute)
const task = cron.schedule('*/10 * * * *', async () => {
  console.log('Scheduler tick: syncing tenants');
  try {
    const tenants = await Tenant.findAll();
    for (const t of tenants) {
      try { await manualSync(t.id); } catch(e) { console.error('sync tenant error', e.message); }
    }
  } catch (e) {
    console.error(e);
  }
}, { scheduled: false });

module.exports = task;
