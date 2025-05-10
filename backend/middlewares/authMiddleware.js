// backend/middlewares/authMiddleware.js
module.exports = function (req, res, next) {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Önce giriş yapın.' });
    }
    next();
  };
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Giriş yapmalısınız' });
};
