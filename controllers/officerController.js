const Officer = require('../models/officerModel');
const VoterID = require('../models/voterIDModel');
const VoterList = require('../models/votersModel');
const Candidate = require('../models/candidateModel');
const Constituency = require('../models/constituencyModel');
const jwt = require('jsonwebtoken');

const votersDetails = async (details) => {
    try {
        const voters = await VoterID.find({ assembly_constituency: details.constituency });

        const votedVoterIds = await VoterList.find({ voted: true });

        const votedVoterIdsArray = votedVoterIds.map(v => v.voterDetails.toString());

        const votedVoters = await VoterID.find({
            _id: { $in: votedVoterIdsArray },
            assembly_constituency: details.constituency
        });

        const pendingVoters = voters.filter(
            voter => !votedVoterIdsArray.includes(voter._id.toString())
        );

        return {
            voters,
            pendingVoterIds: pendingVoters,
            votedVoterIds: votedVoters
        };
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching voter details.");
    }
};

const officerDetails = async (req, res) => {
    try {
        const officerId  = req.officerId;

        const details = await Officer.findOne({ officerID: officerId })
        
        if (!details) {
            return res.status(404).json({ message: 'Officer ID not found' });
        }
        const constituency = await Constituency.findOne({
            _id: details.constituency
        });
        
        return res.status(200).json({
            details: details,
            constituency: constituency.name
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message || 'Server Error'
        });
    }
}

const verifyOfficer = async (req, res) => {
    try {
        const officerId  = req.body.officerId;

        const details = await Officer.findOne({ officerID: officerId });
        if (!details) {
            return res.status(404).json({ message: 'Officer ID not found' });
        }

        const token = jwt.sign(
            { id: details.officerID, role: 'officer'},
            process.env.OFFICER_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            token: token
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const allVoters = async (req, res) => {
    try {
        const officerId  = req.officerId;

        const details = await Officer.findOne({ officerID: officerId });

        if (!details) {
            return res.status(404).json({ message: 'Officer ID not found' });
        }

        const voters = await votersDetails(details);

        return res.status(200).json({
            'voters': voters.voters
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const votedVoters = async (req, res) => {
    try {
        const officerId  = req.officerId;
        const details = await Officer.findOne({ officerID: officerId });
        if (!details) {
            return res.status(404).json({ message: 'Officer ID not found' });
        }

        const voters = (await votersDetails(details)).votedVoterIds;
        
        return res.status(200).json({
            'voters': voters
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const pendingVoters = async (req, res) => {
    try {
        const officerId  = req.officerId;

        const details = await Officer.findOne({ officerID: officerId });
        if (!details) {
            return res.status(404).json({ message: 'Officer ID not found' });
        }

        const voters = (await votersDetails(details)).pendingVoterIds;
        
        return res.status(200).json({
            'voters': voters
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const getCandidates = async (req, res) => {
    try {
        const officerId  = req.officerId;

        const details = await Officer.findOne({ officerID: officerId });
        if (!details) {
            return res.status(404).json({ message: 'Officer ID not found' });
        }

        const candidates = await Candidate.find({
            constituency: details.constituency
        });  
        
        return res.status(200).json({
            'candidates': candidates
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = { verifyOfficer, allVoters, votedVoters, pendingVoters, getCandidates, officerDetails };