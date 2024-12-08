const mongoose = require('mongoose');
const schema = mongoose.Schema;

const VotersSchema = new schema({
    voterDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VoterID',
        required: true,
        unique: true
    },
    voted: {
        type: Boolean,
        required: true
    }
});

const VoterList = mongoose.model('VoterList', VotersSchema);

module.exports = VoterList;
