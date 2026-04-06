import mongoose from 'mongoose';

const WhitelistSchema = new mongoose.Schema({
    phone: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    name: { 
        type: String, 
        default: '' 
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, { timestamps: true });

export default mongoose.models.Whitelist || mongoose.model('Whitelist', WhitelistSchema);
