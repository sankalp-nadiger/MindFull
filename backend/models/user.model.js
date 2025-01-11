import mongoose, { Schema } from "mongoose"

const userSchema = new Schema( {
    username:
    {
        type: String,
        required:true,
        unique:true,
        minLength: 10,
        maxLength: 30
    },
    password:
    {
        type: String,
        required: true,
        unique:true
    },
    avatar:
    {
        type: String,
    },
    age: 
    {
        type: Number,
    },
    email:
    {
        type: String
    },
    journals: [
        {
            type: Schema.Types.ObjectId,
            ref: "Journals"
        }],
        events:
        [
            {
                type:Schema.Types.ObjectId,
                ref: "Event"
            }
        ],
        mood: {
            type: String
        },
        goals:[ {
            type: String
        } ],
        interests: [{
            type: String
        }],
        role: {
            type: String,
            enum: ['Parent', "Mindfull Seeker", 'Teacher', 'Counselor'],
            required: true
        }
}, { timestamps: true})

userSchema.methods.assignRandomAvatar = (user) => {
    const avatars = [
        "https://example.com/avatars/avatar1.png",
        "https://example.com/avatars/avatar2.png",
        "https://example.com/avatars/avatar3.png",
        "https://example.com/avatars/avatar4.png",

    ];
    if (!user.avatar) {
        user.avatar = avatars[Math.floor(Math.random() * avatars.length)];
        user.save();
    }
};