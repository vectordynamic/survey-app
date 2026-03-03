import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Participant from '@/models/Participant';
import Response from '@/models/Response';
import Question from '@/models/Question';

export async function GET() {
    try {
        await dbConnect();

        const totalParticipants = await Participant.countDocuments();
        const completedSurveys = await Participant.countDocuments({ isComplete: true });
        const incompleteSurveys = await Participant.countDocuments({ isComplete: false });
        const totalQuestions = await Question.countDocuments();
        const totalResponses = await Response.countDocuments();

        // Recent participants (last 10)
        const recentParticipants = await Participant.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .select('fullName designation phone isComplete lastAnsweredQuestionIndex createdAt');

        return NextResponse.json({
            totalParticipants,
            completedSurveys,
            incompleteSurveys,
            totalQuestions,
            totalResponses,
            recentParticipants,
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
