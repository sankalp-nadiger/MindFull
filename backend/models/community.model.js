import {Schema, model} from mongoose;

const communitySchema = new Schema({
    name:
    {
        type: String,
        required: true,
        unique: true
    },
    members:
    {
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    posts:
    {
        type: Schema.Types.ObjectId,
        ref:"Posts"
    },
    description:
    {
        type: String,
        required: true
    }
})

export const Community= mongoose.model("Community", communitySchemarSchema);