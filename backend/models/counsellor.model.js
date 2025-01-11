import { model } from "mongoose";
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
    
})

export const Counsellor= mongoose.model("Counsellor", counsellorSchema);