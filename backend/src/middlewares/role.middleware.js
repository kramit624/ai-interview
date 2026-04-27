const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user; // set by auth middleware
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // If no specific roles were provided, any authenticated user is allowed
        if (!allowedRoles) {
            return next();
        }

        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: 'unauthorized | You are not allowed to access this resource' });
        }

        next();
    };
};

module.exports = roleMiddleware;
