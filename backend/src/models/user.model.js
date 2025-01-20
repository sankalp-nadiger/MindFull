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
        mood: {
            type: String
        },
        goals: [ {
            type: String
        } ],
        interests: [{
            type: Schema.Types.ObjectId,
            ref: "Interest"
        }],
        progress: {
          type: Number,
          default: 0, // Percentage progress if it's a goal (e.g., 0-100%)
        },
        idCard:
        {
          type: String
        },
        parent_phone_no: Number,
        lastLoginDate: {
          type: Date,
        },
        parent :{
             type: Schema.Types.ObjectId,
            ref: "parent"
        },
        streak: {
          type: Number,
          default: 0,
        },
        maxStreak: {
          type: Number,
          default: 0,
        },    
        achievements: String
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
        
    }userSchema.pre("save", async function (next) {
        if (!this.isModified("password")) return next();
      
        this.password = await bcrypt.hash(this.password, 10);
        next();
      });
      
      userSchema.methods.isPasswordCorrect = async function (password) {
        return await bcrypt.compare(password, this.password);
      };
      
      userSchema.methods.generateAccessToken = function () {
        return jwt.sign(
          {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
          },
        );
      };
      userSchema.methods.generateRefreshToken = function () {
        return jwt.sign(
          {
            _id: this._id,
          },
          process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
          },
        );
      };
};

export const User= mongoose.model(User, userSchema)