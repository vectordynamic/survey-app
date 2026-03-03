import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Response from '@/models/Response';
import Question from '@/models/Question';

export async function GET() {
    try {
        await dbConnect();

        const questions = await Question.find({}).sort({ order: 1 });
        const analytics = [];

        for (const question of questions) {
            const responses = await Response.find({ questionId: question._id });
            const total = responses.length;

            if (total === 0) {
                analytics.push({
                    _id: question._id,
                    order: question.order,
                    datasetName: question.datasetName,
                    dataElements: question.dataElements,
                    totalResponses: 0,
                    avgImportance: 0,
                    feasibilityYes: 0,
                    feasibilityNo: 0,
                    relevanceYes: 0,
                    relevanceNo: 0,
                });
                continue;
            }

            const importanceSum = responses.reduce((sum, r) => sum + (r.importance || 0), 0);
            const feasibilityYes = responses.filter(r => r.feasibility === true).length;
            const relevanceYes = responses.filter(r => r.relevance === true).length;

            analytics.push({
                _id: question._id,
                order: question.order,
                datasetName: question.datasetName,
                dataElements: question.dataElements,
                totalResponses: total,
                avgImportance: (importanceSum / total).toFixed(2),
                feasibilityYes,
                feasibilityNo: total - feasibilityYes,
                relevanceYes,
                relevanceNo: total - relevanceYes,
            });
        }

        return NextResponse.json({ analytics });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
