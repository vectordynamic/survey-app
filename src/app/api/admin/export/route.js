import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Response from '@/models/Response';
import Question from '@/models/Question';
import Participant from '@/models/Participant';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
    try {
        await dbConnect();

        // 1. Authenticate Admin (Check headers or query param for window.open downloads)
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token') || request.headers.get('authorization')?.split(' ')[1];
        
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const adminId = decoded.adminId || decoded.id;
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Fetch all data
        const questions = await Question.find({}).sort({ order: 1 });
        const responses = await Response.find({})
            .populate('participantId', 'fullName phone educationalQualification experienceYears experienceMonths upazila gender age');

        // 3. Build CSV content with researcher-specific headers
        // Headers: Name, Phone, Qualification, Upazila, Age, Gender, Exp Years, Exp Months, datasetName, dataElements, Importance, Feasibility, Comment
        let csv = 'Name,Phone,Qualification,Upazila,Age,Gender,Exp Years,Exp Months,Question Order,Dataset,Data Element,Importance,Feasibility,Comment\n';

        for (const resp of responses) {
            const question = questions.find(q => q._id.toString() === resp.questionId.toString());
            const p = resp.participantId;

            // Escaping commas and quotes for CSV safety
            const name = `"${p?.fullName || ''}"`;
            const phone = `"${p?.phone || ''}"`;
            const qual = `"${p?.educationalQualification || ''}"`;
            const upazila = `"${p?.upazila || ''}"`;
            const datasetName = `"${question?.datasetName || ''}"`;
            const dataElement = `"${question?.dataElements || ''}"`;
            const comment = `"${(resp.comment || '').replace(/"/g, '""')}"`;

            csv += `${name},${phone},${qual},${upazila},${p?.age || ''},${p?.gender || ''},${p?.experienceYears || 0},${p?.experienceMonths || 0},`;
            csv += `${question?.order || ''},${datasetName},${dataElement},`;
            csv += `${resp.importance || ''},"${resp.feasibility === true ? 'Yes' : 'No'}",${comment}\n`;
        }

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=research_survey_export.csv',
            },
        });
    } catch (error) {
        console.error('Export Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
