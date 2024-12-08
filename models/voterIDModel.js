const mongoose = require('mongoose');
const schema = mongoose.Schema;

const Gender = Object.freeze({
    MALE: 0,
    FEMALE: 1
});

const VoterIDSchema = new schema({
    voterId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String, 
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: Number,
        enum: Object.values(Gender),
        required: true
    },
    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    assembly_constituency: {
        type: String,
        required: true
    }
});

Object.freeze(Gender);

const VoterID = mongoose.model('VoterID', VoterIDSchema);

module.exports = VoterID;
