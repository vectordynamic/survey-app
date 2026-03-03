import dbConnect from '../../../../lib/dbConnect.js';
import Question from '../../../../models/Question.js';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { questions } = body;

        let added = 0;
        let duplicates = 0;

        for (const q of questions) {
            if (!q.datasetName && !q.dataElements) continue;

            const existing = await Question.findOne({
                dataElements: q.dataElements,
                datasetName: q.datasetName
            });

            if (existing) {
                duplicates++;
            } else {
                await Question.create({
                    order: Number(q.order) || 0,
                    facilityCategory: q.facilityCategory || '',
                    datasetName: q.datasetName || '',
                    dataElements: q.dataElements || '',
                    suggestedDisaggregates: q.suggestedDisaggregates || ''
                });
                added++;
            }
        }

        return NextResponse.json({ success: true, added, duplicates });
    } catch (error) {
        console.error('Bulk upload error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
