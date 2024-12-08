const mongoose = require('mongoose');
const schema = mongoose.Schema;

const PartySchema = new schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    voteCount: {
        type: Number,
        default: 0,
        required: true
    }
});

const Party = mongoose.model('Party', PartySchema);

module.exports = Party;
