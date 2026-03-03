import mongoose from 'mongoose';

const ResponseSchema = new mongoose.Schema({
    participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    importance: { type: Number, min: 1, max: 5 },
    feasibility: { type: Boolean },
    relevance: { type: Boolean },
    comment: { type: String, default: '' },
}, { timestamps: true });

// Compound index to prevent duplicate answers
ResponseSchema.index({ participantId: 1, questionId: 1 }, { unique: true });

export default mongoose.models.Response || mongoose.model('Response', ResponseSchema);
