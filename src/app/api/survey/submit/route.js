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

        // Upsert response (update if exists, create if not)
        const response = await Response.findOneAndUpdate(
            { participantId, questionId },
            { importance, feasibility, relevance, comment },
            { upsert: true, new: true }
        );

        // Get the question's order to update progress
        const question = await Question.findById(questionId);
        const totalQuestions = await Question.countDocuments();

        // Update participant progress
        const participant = await Participant.findById(participantId);
        if (question && participant) {
            const newIndex = Math.max(participant.lastAnsweredQuestionIndex, question.order);
            const isComplete = newIndex >= totalQuestions;

            await Participant.findByIdAndUpdate(participantId, {
                lastAnsweredQuestionIndex: newIndex,
                isComplete,
            });
        }

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
