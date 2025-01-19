import {Schema, model} from "mongoose";

const resourceSchema = new Schema({
    title: {
        type: String,
        required:true
    },
    type: {
        type: String, enum :[ 'book', 'video', 'blog', 'podcast', 'event'], required: true 
    },
    content: {
        type: String,
        required: true
    },
    user:{
        type: Schema.Types.ObjectId, ref: 'User', required: true
    },
    referenceId: { type: String, required: true },
    watched: { type: Boolean, default: false },
    related_interests: [{
        type: Schema.Types. ObjectId,
        ref: "Interest"
    }],
    related_issues: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue",
      }], // Links related issues
      related_goals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interest",
      }], 
      createdAt: { 
        type: Date, 
        default: Date.now 
      },
})

export const Resource= model("Resource",resourceSchema)