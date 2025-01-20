import mongoose, {Schema} from "mongoose";

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
        type: String
    }],
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

});
counsellorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
  counsellorSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  
  counsellorSchema.methods.generateAccessToken = function () {
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
  counsellorSchema.methods.generateRefreshToken = function () {
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

export const Counsellor= mongoose.model("Counsellor", counsellorSchema);