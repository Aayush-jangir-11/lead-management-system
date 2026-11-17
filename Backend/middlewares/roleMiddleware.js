// ─── Role-Based Access Control (RBAC) Middleware ─────────────────────────────
// Usage: checkRole('admin') OR checkRole('admin', 'sales_manager')
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if user is attached from protect middleware
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking roles.',
      });
    }

    // 2. Check if user's role is permitted
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Your role: '${req.user.role}'.`,
      });
    }

    // 3. User is authorized, proceed to next handler
    next();
  };
};

module.exports = { checkRole };
