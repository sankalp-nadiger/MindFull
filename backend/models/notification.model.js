import mongoose, {Schema} from mongoose;

const counsellorSchema= new Schema({
    specification:
    [{
        type: String,
        required: true
    }],
    yearexp:
    {
        type: Number,
        required: true
    },
    certifications:[
    {
        type: File
    }],
    rating:
    {
        type: Number
    },
    feedback:[
    {
        type: String
    }],
})

export const Counsellor= mongoose.model("Counsellor", counsellorSchema);