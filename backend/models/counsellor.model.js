import mongoose, {Schema} from mongoose;

const counsellorSchema= new Schema({
    specification:
    {
        type: String,
        required: true
    },
    yearexp:
    {
        type: Number,
        required: true
    },
    certifications:
    {
        type: String
    },
    rating:
    {
        type: Number
    },
    feedback:[
    {
        type: String
    }],
    availability: [
        {
            day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
            slots: [
                {
                    startTime: { type: String, required: true }, // e.g., "14:30"
                    endTime: { type: String, required: true }   // e.g., "15:30"
                }
            ]
        }
    ],

})

export const Counsellor= mongoose.model("Counsellor", counsellorSchema);