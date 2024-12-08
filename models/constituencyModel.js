const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ConstituencySchema = new schema({
    name: {
        type: String,
        unique: true,
        required: true
    }
});

const Constituency = mongoose.model('Constituency', ConstituencySchema);

module.exports = Constituency;
