const mongoose = require('mongoose');
const schema = mongoose.Schema;

const OfficerSchema = new schema({
    officerID: {
        type: String,
        unique: true,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    constituency: {
        type: String,
        required: true
    },
});

const Officer = mongoose.model('Officer', OfficerSchema);

module.exports = Officer;
