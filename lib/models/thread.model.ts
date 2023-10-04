import mongoose from "mongoose";
import { string } from "zod";

const threadSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    parentId: {
        type: String,
    },
    //one thread can have multiple threads as children by ref itself
    //Thread Original
    // -> thread comment 1
    //   -> thread comment 2
    // -> thread comment 3
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread',
        }
    ]
});

const Thread = mongoose.models.Thread || mongoose.model('Thread', threadSchema);

export default Thread;