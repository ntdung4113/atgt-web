exports.safeRoutePath = (path) => {
    if (!path) return '/';

    if (path.includes('://')) {
        return path.replace(/:/g, '%3A');
    }

    return path;
};

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