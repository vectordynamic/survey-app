import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Whitelist from '@/models/Whitelist';
import jwt from 'jsonwebtoken';

async function verifyAdmin(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        return null;
    }
}

export async function GET(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const whitelist = await Whitelist.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ whitelist });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { participants } = await request.json(); // List of { phone, name }

        if (!Array.isArray(participants)) {
            return NextResponse.json({ error: 'Invalid input format' }, { status: 400 });
        }

        let addedCount = 0;
        let skippedCount = 0;

        for (const p of participants) {
            if (!p.phone) continue;
            
            // Check if already exists
            const exists = await Whitelist.findOne({ phone: p.phone });
            if (exists) {
                skippedCount++;
                continue;
            }

            await Whitelist.create({
                phone: p.phone,
                name: p.name || '',
                addedBy: admin.adminId
            });
            addedCount++;
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully added ${addedCount} participants. ${skippedCount} skipped (already exists).` 
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            await Whitelist.findByIdAndDelete(id);
        } else {
            // Optional: delete all if no ID provided? Maybe too dangerous.
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
