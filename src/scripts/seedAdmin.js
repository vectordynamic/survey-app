import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load .env.local from project root BEFORE any other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedAdmin() {
    // Dynamically import dependencies after env is loaded
    const { default: dbConnect } = await import('../lib/dbConnect.js');
    const { default: Admin } = await import('../models/Admin.js');

    try {
        await dbConnect();

        const existing = await Admin.findOne({ username: 'admin' });
        if (existing) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 12);
        await Admin.create({
            username: 'admin',
            password: hashedPassword,
        });

        console.log('Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seedAdmin();
