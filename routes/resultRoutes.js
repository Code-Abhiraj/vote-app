const express = require('express');
const { getCandidates, getParties } = require('../controllers/resultsController');

const router = express.Router();

router.get('/parties', getParties);
router.post('/candidates', getCandidates);

module.exports = router;