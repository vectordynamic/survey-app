import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Participant from '@/models/Participant';
import Whitelist from '@/models/Whitelist';

export async function POST(request) {
    try {
        await dbConnect();
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // 1. Check Whitelist
        const isWhitelisted = await Whitelist.findOne({ phone });
        if (!isWhitelisted) {
            return NextResponse.json({ 
                error: 'Unauthorized', 
                message: 'Your phone number is not listed in our authorized participant list. Please contact the administrator.' 
            }, { status: 403 });
        }

        // 2. Check existing Participant
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

        // Return whitelisted info to help with registration
        return NextResponse.json({ exists: false, whitelistedName: isWhitelisted.name });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
