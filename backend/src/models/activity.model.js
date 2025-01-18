import {Schema, model} from "mongoose";

const activitySchema = new Schema({
    title: {
        type: String,
        required:true
    },
    type: {
        type: String,
        required:true
    },
    content: {
        type: String,
        required: true
    },
    interests: [{
        type: Schema.Types. ObjectId,
        ref: "Interest"
    }],
})

export const Activity= model("Activity",activitySchema)