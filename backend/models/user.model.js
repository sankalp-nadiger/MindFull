import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minLength: 10,
      maxLength: 30,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["M", "F"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    journals: [
      {
        type: Schema.Types.ObjectId,
        ref: "Journals",
      },
    ],
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
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
      type: String,
    },
    goals: [
      {
        type: String,
      },
    ],
    interests: [
      {
        type: Schema.Types.ObjectId,
        ref: "Interest",
      },
    ],
  
    lastLoginDate: {
      type: Date,
    },
    streak: {
      type: Number,
      default: 0,
    },
    maxStreak: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Method to assign random avatar
userSchema.methods.assignRandomAvatar = async function () {
  const male_avatars = [
    "https://tse2.mm.bing.net/th?id=OIP.Yj7V4oP9Noi8p77a8Oyd5QHaJA&pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th?id=OIP.zxQil4x4JMZtZm-7tUNF1QHaH_&pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th?id=OIP.CHiM-UEsM0jqElrYHEftiwHaHa&pid=Api&P=0&h=180",
    "https://tse2.mm.bing.net/th?id=OIP.2Be2070ayk9DYoV9xRXFEgHaHa&pid=Api&P=0&h=180",
  ];

  const female_avatars = [
    "https://tse3.mm.bing.net/th?id=OIP.GYuOR-Ox5UCX3-R_Qz49aQHaHa&pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th?id=OIP.HJ_CpQ29Bd9OeU98QDMe-gHaHa&pid=Api&P=0&h=180",
    "https://tse3.mm.bing.net/th?id=OIP.KpNNDej-Xh6Njm4Xf-15BQHaHa&pid=Api&P=0&h=180",
    "https://tse1.mm.bing.net/th?id=OIP.opldioYHZSr8ja6_DlApqgHaHa&pid=Api&P=0&h=180",
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

// Pre-save hook to hash the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check password correctness
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate an access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Method to generate a refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
