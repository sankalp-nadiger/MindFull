import { Schema, model } from "mongoose";

const eventSchema = new Schema ({
    entryText:
    {
        type: String,
        required: true
    },
    hostedBy: String,
    type: [String],
    date: Date,
    location: {
        type: {
          type: String,
          enum: ["Point"], // GeoJSON type for geospatial data
          required: true,
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
        address: {
          type: String, // Human-readable address
        },
      },
    slots: 
        {
            startTime: { type: String, required: true }, // e.g., "14:30"
            endTime: { type: String, required: true }   // e.g., "15:30"
        },
    description:
    {
        type: String,
        required: true
    }
})

export const Event = model("Event",eventSchema)