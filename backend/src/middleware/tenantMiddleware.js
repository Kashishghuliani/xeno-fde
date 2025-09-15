function tenantMiddleware(req, res, next) {
  // prefer tenant id from JWT
  if (req.user && req.user.tenantId) {
    req.tenantId = req.user.tenantId;
  } else if (req.headers['x-tenant-id']) {
    req.tenantId = req.headers['x-tenant-id'];
  } else {
    return res.status(400).json({ error: 'Tenant not provided' });
  }
  next();
}
module.exports = tenantMiddleware;
