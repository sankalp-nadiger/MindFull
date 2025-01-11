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
    gender:{
        type:String,enum:["M","F"],
        required:true 
    },
    email:
    {
        type: String,
        required:true
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
    const male_avatars = [
        "https://tse2.mm.bing.net/th?id=OIP.Yj7V4oP9Noi8p77a8Oyd5QHaJA&pid=Api&P=0&h=180",
         "https://tse2.mm.bing.net/th?id=OIP.zxQil4x4JMZtZm-7tUNF1QHaH_&pid=Api&P=0&h=180",  
         "https://tse3.mm.bing.net/th?id=OIP.CHiM-UEsM0jqElrYHEftiwHaHa&pid=Api&P=0&h=180",
         "https://tse2.mm.bing.net/th?id=OIP.2Be2070ayk9DYoV9xRXFEgHaHa&pid=Api&P=0&h=180"

]   
        const female_avatars=[
        "https://tse3.mm.bing.net/th?id=OIP.GYuOR-Ox5UCX3-R_Qz49aQHaHa&pid=Api&P=0&h=180",
        "https://tse1.mm.bing.net/th?id=OIP.HJ_CpQ29Bd9OeU98QDMe-gHaHa&pid=Api&P=0&h=180",
        "https://tse3.mm.bing.net/th?id=OIP.KpNNDej-Xh6Njm4Xf-15BQHaHa&pid=Api&P=0&h=180",
        "https://tse1.mm.bing.net/th?id=OIP.opldioYHZSr8ja6_DlApqgHaHa&pid=Api&P=0&h=180"
    ];
    if (!user.avatar) {
        if(user.gender=="M"){
            user.avatar = avatars[Math.floor(Math.random() * male_avatars.length)];
            user.save();
        }
        if(user.gender=="F"){
            user.avatar = avatars[Math.floor(Math.random() * female_avatars.length)];
            user.save();
        }
        
    }
};