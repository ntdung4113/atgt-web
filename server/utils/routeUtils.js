/**
 * Utility functions for handling route paths safely
 */

/**
 * Safely converts a string to a valid Express route path
 * by escaping any characters that might be misinterpreted
 */
exports.safeRoutePath = (path) => {
    if (!path) return '/';

    // If the path looks like a URL with a colon, escape it properly
    if (path.includes('://')) {
        // Replace the colon with its encoded form
        return path.replace(/:/g, '%3A');
    }

    return path;
};

/**
 * Middleware to catch path-to-regexp errors before they crash the app
 */
exports.pathErrorHandler = (req, res, next) => {
    try {
        next();
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('Missing parameter name')) {
            console.error('Path-to-regexp error caught:', error.message);
            return res.status(400).json({
                error: 'Invalid route format',
                message: 'The requested URL contains characters that cannot be processed as a route'
            });
        }
        next(error);
    }
};