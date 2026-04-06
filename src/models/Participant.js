import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    fullName: { type: String, default: '' },
    educationalQualification: { type: String, default: '' },
    age: { type: Number },
    gender: { type: String, default: '' },
    experienceYears: { type: Number, default: 0 },
    experienceMonths: { type: Number, default: 0 },
    upazila: { type: String, default: '' },
    lastAnsweredQuestionIndex: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Participant || mongoose.model('Participant', ParticipantSchema);
