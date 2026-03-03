import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
    order: { type: Number, required: true },
    facilityCategory: { type: String, default: '' },
    datasetName: { type: String, default: '' },
    dataElements: { type: String, default: '' },
    suggestedDisaggregates: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
