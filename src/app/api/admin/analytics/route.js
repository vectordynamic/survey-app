import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Response from '@/models/Response';
import Question from '@/models/Question';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
    try {
        await dbConnect();

        // 1. Authenticate Admin
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

        // 2. Fetch all questions and responses
        const questions = await Question.find({}).sort({ order: 1 });
        
        // Fetch ALL responses and populate participant names
        const allResponses = await Response.find({})
            .populate('participantId', 'fullName')
            .lean();

        // 3. Group responses by questionId for fast lookup
        const respByQ = {};
        allResponses.forEach(r => {
            if (!respByQ[r.questionId]) respByQ[r.questionId] = [];
            respByQ[r.questionId].push(r);
        });

        // 4. Generate Analytics
        const analytics = questions.map(question => {
            const responses = respByQ[question._id.toString()] || [];
            const total = responses.length;

            if (total === 0) {
                return {
                    _id: question._id,
                    order: question.order,
                    datasetName: question.datasetName,
                    dataElements: question.dataElements,
                    totalResponses: 0,
                    avgImportance: 0,
                    feasibilityYes: 0,
                    feasibilityNo: 0,
                    comments: []
                };
            }

            const importanceSum = responses.reduce((sum, r) => sum + (r.importance || 0), 0);
            const feasibilityYes = responses.filter(r => r.feasibility === true).length;
            
            // Extract comments with participant names as requested
            const comments = responses
                .filter(r => r.comment && r.comment.trim())
                .map(r => ({
                    participantName: r.participantId?.fullName || 'Anonymous',
                    text: r.comment
                }));

            return {
                _id: question._id,
                order: question.order,
                datasetName: question.datasetName,
                dataElements: question.dataElements,
                totalResponses: total,
                avgImportance: (importanceSum / total).toFixed(2),
                feasibilityYes,
                feasibilityNo: total - feasibilityYes,
                comments: comments
            };
        });

        return NextResponse.json({ analytics });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
