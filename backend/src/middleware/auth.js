const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  console.log('Authorization header:', req.headers.authorization);

  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing token' });

  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch(err) {
    console.log('JWT error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
