import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    mobileNumber: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '5m' }, // Automatically deletes after 5 minutes
});

export const OTP= mongoose.model('OTP', otpSchema);
