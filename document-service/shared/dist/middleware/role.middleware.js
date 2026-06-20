"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized', message: 'Authentication required', statusCode: 401 });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: `Access restricted to: ${roles.join(', ')}`,
                statusCode: 403,
            });
            return;
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map