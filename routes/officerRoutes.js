const express = require('express');
const { verifyOfficer, allVoters, votedVoters, pendingVoters, getCandidates, officerDetails } = require('../controllers/officerController');
const OfficerMiddleware = require('../middleware/officerMiddleware');

const router = express.Router();

router.post('/verify', verifyOfficer);
router.get('/all', OfficerMiddleware, allVoters);
router.get('/voted', OfficerMiddleware, votedVoters);
router.get('/pending', OfficerMiddleware, pendingVoters);
router.get('/candidates', OfficerMiddleware, getCandidates);
router.get('/details', OfficerMiddleware, officerDetails);

module.exports = router;