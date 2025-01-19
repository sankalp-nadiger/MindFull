import {Schema, model} from "mongoose";

const resourceSchema = new Schema({
    title: {
        type: String,
        required:true
    },
    type: {
        type: String, enum : [events, audio, video, podcast, extblog],
        required:true
    },
    content: {
        type: File,
        required: true
    },
    related_interests: [{
        type: Schema.Types. ObjectId,
        ref: "Interest"
    }],
})

export const Resource= model("Resource",resourceSchema)