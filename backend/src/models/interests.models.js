import {Schema,model} from "mongoose";

const interestSchema= new Schema({
    user: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      } ],
      name: {
        type: String, // Allows for dynamic types
        required: true,
        // validate: {
        //   validator: function (value) {
        //     // Validate based on isGoal field
        //     if (this.isGoal) {
        //       return typeof value === "string"; // If isGoal is true, name should be a string
        //     } else {
        //       return Array.isArray(value) && value.every((v) => typeof v === "string"); // If not, name should be an array of strings
        //     }
        //   },
        //   message: "Invalid name format: must be a string if isGoal is true, or an array of strings otherwise.",
        // },
      },    
    // priority: {
    //   type: Number,
    //   default: 1, // Helps rank the importance of the interest (e.g., 1 = high priority)
    // },
    isGoal: {
      type: Boolean,
      default: false, // Indicates if the interest is also a goal
    },
})

export const Interest = model("Interest",interestSchema)