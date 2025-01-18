import { Schema, model } from "mongoose";

const journalSchema = new Schema ({
    user:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    entryText:
    {
        type: String,
        required: true
    },
    topic: String,
    entryDate: Date,
    moodScore: Number
})

export const Journal = model("Journal",journalSchema)