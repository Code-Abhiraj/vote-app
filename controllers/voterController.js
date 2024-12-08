const Candidate = require('../models/candidateModel');
const VoterID = require('../models/voterIDModel');
const VoterList = require('../models/votersModel');
const Party = require('../models/partyModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const OTP = require('../models/OTP'); 
const Constituency = require('../models/constituencyModel');


const sendOTP = async (email) => {
    try {
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use any service
        auth: {
            user: 'pantheonbit3@gmail.com', // Replace with your email
            pass: 'dgapfopbiddcclwr', // Replace with your email password or app password
        }
    });
    console.log('Transporter:', transporter);
    // Save the OTP and its expiration time
    await OTP.create({
        email,
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000, // OTP expires in 5 minutes
    });

    // Send email with OTP
    const mailOptions = {
        from: 'pantheonbit3@gmail.com',
        to: email,
        subject: 'Voter OTP Verification',
        text: `Your OTP for voter verification is: ${otp}`,
    };
    console.log('OPTIONS:', mailOptions);
    await transporter.sendMail(mailOptions);
    console.log('Reached');
    }   catch(err) {
        console.log(err);
    }
};
const fetchCandidates = async(req, res) => {
    try {
        const voterId = req.voterId;
        console.log(voterId);
        const details = await VoterID.findOne({ voterId });
        if (!details) {
            return res.status(400).json({
                message: 'VoterID not found'
            });
        }

        const constituency = await Constituency.findOne({ _id: details.assembly_constituency });
        console.log('COn:', constituency);
        if(!constituency){
            return res.status(409).json({
                message: 'No such constituency'
            });
        }

        const candidates = await Candidate.find({
            constituency: details.assembly_constituency
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
            party_name: partiesMap[candidate.party] || 'Unknown' 
        }));

        return res.status(200).json({
                result: result,
                constituency: constituency.name,
                details: details
        });
        
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

const verifyVoter = async (req, res) => {
    try {
        const voterId = req.body.voterId;

        const details = await VoterID.findOne({ voterId });
        if (!details) {
            return res.status(400).json({
                message: 'VoterID not found'
            });
        }
        
        const voter = await VoterList.findOne({ voterDetails: details._id });
        if (voter && voter.voted) {
            return res.status(401).json({
                message: 'Voter has already voted'
            });
        }   
        console.log('voter:', voter);
        if (!voter) {
            await VoterList.create({
                voterDetails: details._id,  
                voted: false
            });
        }
        console.log('Details:', details);
        // Send OTP to the voter's email
        await sendOTP(details.email);

        console.log('Rec0000');

        return res.status(200).json({
            message: 'OTP sent to email',
        });
        
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: err.message
        });
    }
};
const verifyOTP = async (req, res) => {
    try {
        const { voterId, otp } = req.body;
        console.log(voterId);
        // Find OTP entry for the provided email
        const details = await VoterID.findOne({ voterId });
        if (!details) {
            return res.status(400).json({
                message: 'VoterID not found'
            });
        }
        const email = details.email;
        console.log(email);
        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({
                message: 'OTP not found for this email'
            });
        }

        // Check if OTP has expired
        if (otpRecord.expiresAt < Date.now()) {
            return res.status(400).json({
                message: 'OTP has expired'
            });
        }
        console.log(typeof otp, typeof otpRecord.otp);
        // Check if the OTP is correct
        if (otpRecord.otp.toString() !== otp) {
            return res.status(400).json({
                message: 'Invalid OTP'
            });
        }

        // OTP is valid, create JWT token
        const token = jwt.sign(
            { id: voterId, role: 'voter' },
            process.env.VOTER_SECRET,
            { expiresIn: '1d' }
        );

        // Delete OTP from the database as it's used
        await OTP.deleteOne({ email });

        return res.status(200).json({
            token: token
        });
        
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const castVote = async (req, res) => {
    try {
        const voterId = req.voterId;
        const candidateId = req.body.candidateId;

        const details = await VoterID.findOne({ voterId });
        if (!details) {
            return res.status(400).json({
                message: 'VoterID not found'
            });
        }

        let voter = await VoterList.findOne({ voterDetails: details._id });
        if (voter && voter.voted) {
            return res.status(401).json({
                message: 'Voter have already voted'
            });
        }

        if (!voter) {
            voter = await VoterList.create({
                voterDetails: details._id,  
                voted: false
            });
        }

        const candidate = await Candidate.findOne({
            candidateID: candidateId
        });

        if(!candidate) {
            return res.status(402).json('Invalid Candidate Id');
        }

        const party = await Party.findOne({
            _id : new mongoose.Types.ObjectId(candidate.party)
        });

        if(!party) {
            return res.status(403).json('Invalid Party');
        }

        candidate.voteCount += 1;
        await candidate.save();

        party.voteCount += 1;
        await party.save();

        voter.voted = true;
        await voter.save();
        console.log('done');

        return res.status(200).json({
            message: 'Vote Casted'
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: err
        });
    }
};


module.exports = { verifyVoter, castVote, fetchCandidates, verifyOTP };