const jwt = require('jsonwebtoken');

const OfficerMiddleware = (req, res, next) => {
    try {
        const token = req.headers.token;
        if(!token) {
            return res.status(406).json({
                'message': 'Token not found'
            });
        }
        const decoded = jwt.verify(token, process.env.OFFICER_SECRET);
        if(!decoded) {
            return res.status(407).json({
                'message': 'Invalid Token'
            });
        }
        req.officerId = decoded.id;
        next();
    } catch(err) {
        return res.status(500).json({
            'message' : err
        });
    }
}

module.exports = OfficerMiddleware;