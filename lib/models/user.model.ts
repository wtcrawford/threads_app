import mongoose from "mongoose";
import { string } from "zod";

const userSchema = new mongoose.Schema({
    id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: String,
    bio: String,
    //one user can have multiple references to specific threads stored in db
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }
    ],
    likedThreads: [
        //array of thread IDs
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread',
        }
    ],
    onboarded: {
        type: Boolean,
        default: false,
    },
    //once again, an object and can belog to multiple
    communities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community'
        }
    ]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;