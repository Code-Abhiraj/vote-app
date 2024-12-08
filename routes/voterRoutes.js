const express = require('express');
const { verifyVoter, castVote, fetchCandidates, verifyOTP } = require('../controllers/voterController');
const VoterMiddleware = require('../middleware/voterMiddleware');

const router = express.Router();

router.post('/verify', verifyVoter);
router.get('/fetch', VoterMiddleware, fetchCandidates);
router.post('/vote', VoterMiddleware, castVote);
router.post('/otp', verifyOTP);

module.exports = router;