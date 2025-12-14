import mongoose, { Schema } from "mongoose"
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

const userSchema = new Schema( {
  
    username:
    {
        type: String,
        required:true,
        unique:true,
        maxLength: 30
    },
    fullName:
    {
      type: String,
      required:true,
      unique:true,
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
        type:String,enum:["Male","Female","Other"],
        required:true 
    },
    email:
    {
        type: String,
        required:true
    },
  gameScores: [{
  gameName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
}],
  totalScore: {
  type: Number,
  default: 0
},
    journals: [
        {
            type: Schema.Types.ObjectId,
            ref: "Journal"
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
           
          },
          coordinates: {
            type: [Number], // [longitude, latitude]
         
          },
          address: {
            type: String, // Human-readable address
          },
        },
        mood: {
            type: String
        },
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
        phone_no: {
          type: String
        },
        parent_phone_no: Number,
        lastLoginDate: {
          type: Date,
        },
        issues:
        [{
          type: Schema.Types.ObjectId,
            ref: "Issue"
        }],
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
        fcmToken: String,
        refreshToken: String,
        achievements: String,
        district: String,
        state: String,
        sessionProgress: { type: Number, default: 15 },
        counsellorReviews: [
          {
            sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
            counselorId: { type: Schema.Types.ObjectId, ref: 'Counsellor' },
            diagnosis: String,
            symptoms: [String],
            needsSittings: Boolean,
            recommendedSittings: Number,
            willingToTreat: Boolean,
            notes: String,
            reviewedAt: Date
          }
        ],
        counselorProgress: [
          {
            counselor: { type: Schema.Types.ObjectId, ref: "Counsellor" },
            sittingProgress: { type: Number, default: 0 },
            lastSession: { type: Date },
            excludeNext: { type: Boolean, default: false }
          }
        ],
        sittingNotes: { type: [String], default: [] },
        inSittingSeries: { type: Boolean, default: false },
}, { timestamps: true})

userSchema.methods.assignRandomAvatar = async function () {
  const male_avatars = [
    "https://tse2.mm.bing.net/th?id=OIP.Yj7V4oP9Noi8p77a8Oyd5QHaJA&pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th?id=OIP.zxQil4x4JMZtZm-7tUNF1QHaH_&pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th?id=OIP.CHiM-UEsM0jqElrYHEftiwHaHa&pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th?id=OIP.2Be2070ayk9DYoV9xRXFEgHaHa&pid=Api&P=0&h=180"
  ];

  const female_avatars = [
    "https://tse3.mm.bing.net/th?id=OIP.GYuOR-Ox5UCX3-R_Qz49aQHaHa&pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th?id=OIP.HJ_CpQ29Bd9OeU98QDMe-gHaHa&pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th?id=OIP.KpNNDej-Xh6Njm4Xf-15BQHaHa&pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th?id=OIP.opldioYHZSr8ja6_DlApqgHaHa&pid=Api&P=0&h=180"
  ];

  if (!this.avatar) {
    if (this.gender === "M") {
      this.avatar = male_avatars[Math.floor(Math.random() * male_avatars.length)];
    } else if (this.gender === "F") {
      this.avatar = female_avatars[Math.floor(Math.random() * female_avatars.length)];
    }
    await this.save();
  }
};

// Pre-save hook for password hashing
userSchema.pre("save", async function (next) {
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


export const User= mongoose.model("User", userSchema)