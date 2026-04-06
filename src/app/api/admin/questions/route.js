import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function authenticate(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const adminId = decoded.adminId || decoded.id;
        const admin = await Admin.findById(adminId);
        return admin;
    } catch (err) {
        return null;
    }
}

// GET: Fetch all questions for admin management
export async function GET(request) {
    try {
        await dbConnect();
        const admin = await authenticate(request);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const questions = await Question.find({}).sort({ order: 1 });
        return NextResponse.json({ questions });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Add a single question manually
export async function POST(request) {
    try {
        await dbConnect();
        const admin = await authenticate(request);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        
        // Auto-assign order if not provided
        if (!body.order) {
            const lastQ = await Question.findOne().sort({ order: -1 });
            body.order = (lastQ?.order || 0) + 1;
        }

        const question = await Question.create(body);
        return NextResponse.json({ question, message: 'Question added successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update an existing question
export async function PUT(request) {
    try {
        await dbConnect();
        const admin = await authenticate(request);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { _id, ...updateData } = body;

        if (!_id) return NextResponse.json({ error: 'Question ID required' }, { status: 400 });

        const question = await Question.findByIdAndUpdate(_id, updateData, { new: true });
        if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

        return NextResponse.json({ question, message: 'Update successful' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove an individual question
export async function DELETE(request) {
    try {
        await dbConnect();
        const admin = await authenticate(request);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Question ID required' }, { status: 400 });

        const question = await Question.findByIdAndDelete(id);
        if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
