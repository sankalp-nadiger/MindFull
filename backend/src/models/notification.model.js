import mongoose, {Schema} from mongoose;

const notificationSchema= new Schema({
    message:
    [{
        type: String,
        required: true
    }],
    user:
    {
        type: Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    relatedInterest:
    {
        type: Schema.Types.ObjectId,
        ref: "Interest"
    },
    type:
    {
        type: String, enum: [chat, update],
        required: true,
    },
    event:
    {
        type: Schema.Types.ObjectId,
        ref: "Event"
    },
},{timestamps: true})

export const Notification= mongoose.model("Notification", notificationSchema);