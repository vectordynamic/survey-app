import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAggregation() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({
        dataTitle: String
    }));

    const total = await Question.countDocuments();
    const datasets = await Question.aggregate([
        { $group: { _id: '$dataTitle', count: { $sum: 1 } } }
    ]);

    console.log('Total Questions:', total);
    console.log('Datasets Aggregated:', datasets);
    process.exit(0);
}

testAggregation().catch(err => {
    console.error(err);
    process.exit(1);
});
