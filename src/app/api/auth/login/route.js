import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Participant from '@/models/Participant';

export async function POST(request) {
    try {
        await dbConnect();
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const participant = await Participant.findOne({ phone });

        if (participant) {
            return NextResponse.json({
                exists: true,
                participant: {
                    _id: participant._id,
                    fullName: participant.fullName,
                    lastAnsweredQuestionIndex: participant.lastAnsweredQuestionIndex,
                    isComplete: participant.isComplete,
                },
            });
        }

        return NextResponse.json({ exists: false });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
