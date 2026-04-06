import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
    try {
        await dbConnect();

        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const adminId = decoded.adminId || decoded.id;
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        
        // Ensure Question model is registered and accessible
        const total = await Question.countDocuments();
        const datasets = await Question.aggregate([
            { $group: { _id: '$dataTitle', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        return NextResponse.json({ total, datasets: datasets || [] });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
