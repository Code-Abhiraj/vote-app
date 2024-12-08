const mongoose = require('mongoose');
const schema = mongoose.Schema;

const OTPSchema = new schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

const OTP = mongoose.model('OTP', OTPSchema);

module.exports = OTP;
