const jwt = require('jsonwebtoken');

const VoterMiddleware = (req, res, next) => {
    try {
        const token = req.headers.token;
        if(!token) {
            return res.status(406).json({
                'message': 'Token not found'
            });
        }
        const decoded = jwt.verify(token, process.env.VOTER_SECRET);
        if(!decoded) {
            return res.status(407).json({
                'message': 'Invalid Token'
            });
        }
        req.voterId = decoded.id;
        next();
    } catch(err) {
        return res.status(500).json({
            'message' : err
        });
    }
}

module.exports = VoterMiddleware;