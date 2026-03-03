import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';

// GET: Fetch all questions sorted by order
export async function GET() {
    try {
        await dbConnect();
        const questions = await Question.find({}).sort({ order: 1 });
        return NextResponse.json({ questions });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new question (Admin)
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const question = await Question.create(body);
        return NextResponse.json({ question }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update a question (Admin)
export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
        }

        const question = await Question.findByIdAndUpdate(_id, updateData, { new: true });
        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json({ question });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Delete a question (Admin)
export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
        }

        const question = await Question.findByIdAndDelete(id);
        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
