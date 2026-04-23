import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Response from '@/models/Response';
import Participant from '@/models/Participant';
import Question from '@/models/Question';

export async function POST(request) {
    try {
        await dbConnect();
        const { participantId, questionId, importance, feasibility, relevance, comment } = await request.json();

        if (!participantId || !questionId) {
            return NextResponse.json({ error: 'participantId and questionId are required' }, { status: 400 });
        }

        // 1. Update response and fetch metadata in parallel
        const [response, question, count] = await Promise.all([
            Response.findOneAndUpdate(
                { participantId, questionId },
                { importance, feasibility, relevance, comment },
                { upsert: true, new: true, lean: true }
            ),
            Question.findById(questionId, 'order').lean(),
            Question.countDocuments()
        ]);

        // 2. Update participant progress atomically
        if (question) {
            const isComplete = question.order >= count;
            await Participant.findByIdAndUpdate(participantId, {
                $max: { lastAnsweredQuestionIndex: question.order },
                $set: { isComplete }
            });
        }

        return NextResponse.json({ success: true, response });

        return NextResponse.json({ success: true, response });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET: Fetch responses for a participant
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const participantId = searchParams.get('participantId');

        if (!participantId) {
            return NextResponse.json({ error: 'participantId is required' }, { status: 400 });
        }

        const responses = await Response.find({ participantId });
        return NextResponse.json({ responses });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
