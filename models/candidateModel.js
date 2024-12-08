const mongoose = require('mongoose');
const schema = mongoose.Schema;

const CandidateSchema = new schema({
    candidateID: {
        type: String,
        unique: true,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true 
    },
    constituency: {
        type: String,
        required: true
    },
    voteCount: {
        type: Number,
        required: true,
        default: 0
    }
});

const Candidate = mongoose.model('Candidate', CandidateSchema);

module.exports = Candidate;
