import mongoose from 'mongoose';
import {Schema, model} from 'mongoose';

const communitySchema = new Schema({
    name:
    {
        type: String,
        required: true,
        unique: true
    },
    members:
    [{
        type: Schema.Types.ObjectId,
        ref:"User"
    }],
    posts:
    {
        type: Schema.Types.ObjectId,
        ref:"Posts"
    },
    description:
    {
        type: String,
        required: true
    },
    createdBy:
    {
        type: Schema.Types.ObjectId,
        ref:"User"
    }
})

export const Community= mongoose.model("Community", communitySchema);