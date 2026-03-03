import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Response from '@/models/Response';
import Question from '@/models/Question';
import Participant from '@/models/Participant';

export async function GET() {
    try {
        await dbConnect();

        const questions = await Question.find({}).sort({ order: 1 });
        const responses = await Response.find({}).populate('participantId', 'fullName designation phone');
        const participants = await Participant.find({}).select('fullName designation phone isComplete');

        // Build CSV content
        let csv = 'Participant Name,Designation,Phone,Question Order,Dataset Name,Data Elements,Importance,Feasibility,Relevance,Comment\n';

        for (const resp of responses) {
            const question = questions.find(q => q._id.toString() === resp.questionId.toString());
            const participant = resp.participantId;

            csv += `"${participant?.fullName || ''}","${participant?.designation || ''}","${participant?.phone || ''}",`;
            csv += `${question?.order || ''},"${question?.datasetName || ''}","${question?.dataElements || ''}",`;
            csv += `${resp.importance || ''},"${resp.feasibility ?? ''}","${resp.relevance ?? ''}","${resp.comment || ''}"\n`;
        }

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=survey_responses.csv',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
