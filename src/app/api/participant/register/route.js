import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Participant from '@/models/Participant';

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const { 
            phone, 
            fullName, 
            educationalQualification, 
            age, 
            gender, 
            experienceYears, 
            experienceMonths, 
            upazila 
        } = body;

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Check if participant already exists
        const existing = await Participant.findOne({ phone });
        if (existing) {
            return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
        }

        const participant = await Participant.create({
            phone,
            fullName,
            educationalQualification,
            age,
            gender,
            experienceYears: Number(experienceYears) || 0,
            experienceMonths: Number(experienceMonths) || 0,
            upazila,
            lastAnsweredQuestionIndex: 0,
            isComplete: false,
        });

        return NextResponse.json({
            success: true,
            participant: {
                _id: participant._id,
                fullName: participant.fullName,
                phone: participant.phone,
            },
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
