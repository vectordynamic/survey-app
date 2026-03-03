import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    fullName: { type: String, default: '' },
    designation: { type: String, default: '' },
    age: { type: Number },
    gender: { type: String, default: '' },
    areaOfWork: { type: String, default: '' },
    organization: { type: String, default: '' },
    email: { type: String, default: '' },
    yearsExperience: { type: Number },
    lastAnsweredQuestionIndex: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Participant || mongoose.model('Participant', ParticipantSchema);
