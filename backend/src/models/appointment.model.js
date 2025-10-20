import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    counsellorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Counsellor',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true // Format: "14:30"
    },
    endTime: {
        type: String,
        required: true // Format: "15:30"
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    notes: {
        type: String
    },
    sessionType: {
        type: String,
        enum: ['initial', 'follow-up', 'emergency'],
        default: 'follow-up'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);