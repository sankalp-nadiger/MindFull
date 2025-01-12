import {Schema,model} from mongoose;

const interestSchema= new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      } ,
    topic:
    {
      type: String, //Category
      required: true
    },
    priority: {
      type: Number,
      default: 1, // Helps rank the importance of the interest (e.g., 1 = high priority)
    },
    isGoal: {
      type: Boolean,
      default: false, // Indicates if the interest is also a goal
    },
    progress: {
      type: Number,
      default: 0, // Percentage progress if it's a goal (e.g., 0-100%)
    },

})

export const Interest = model("Interest",interestSchema)