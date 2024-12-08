const Candidate = require('../models/candidateModel');
const Party = require('../models/partyModel');
const Constituency = require('../models/constituencyModel');
const mongoose = require('mongoose');

const getCandidates = async (req, res) => {
    try {
        const name = req.body.name;

        const constituency = await Constituency.findOne({
            name: name
        });

        if (!constituency) {
            return res.status(405).json({
                message: 'Invalid Constituency'
            });
        }

        const candidates = await Candidate.find({
            constituency: constituency._id.toString()
        });

        if (!candidates || candidates.length === 0) {
            return res.status(404).json({
                message: 'No candidates found for this constituency'
            });
        }

        const partiesIds = candidates.map(candidate => new mongoose.Types.ObjectId(candidate.party));

        let parties = await Party.find({
            _id: { $in: partiesIds },
        });

        const partiesMap = parties.reduce((map, party) => {
            map[party._id.toString()] = party.name; 
            return map;
        }, {});

        const result = candidates.map(candidate => ({
            ...candidate.toObject(), 
            name: partiesMap[candidate.party] || 'Unknown' 
        }));
        parties = result;

        console.log(parties);
        return res.status(200).json({
            parties: parties
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: err.message
        });
    }
};

const getParties = async(req, res) => {
    try {
        const parties = await Party.find({});
        return res.status(200).json({
            parties: parties
        });
    } catch(err) {
        return res.status(500).json({
            'message': err
        });
    }
}

module.exports = {getCandidates, getParties};