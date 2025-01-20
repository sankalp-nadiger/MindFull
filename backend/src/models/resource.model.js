import {Schema, model} from "mongoose";

const resourceSchema = new Schema({
  url: String,
  type: {
    type: String,
    enum: ['book', 'video', 'blog', 'podcast', 'event'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: String,
  related_interest: [{
    type: Schema.Types.ObjectId,
    ref: 'Interest'
  }],
  related_issues: [{
    type: Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  related_goals: [{
    type: Schema.Types.ObjectId,
    ref: 'Interest'
  }],
  watched: {
    type: Boolean,
    default: false
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Map,
    of: String
  }
},{
  timestamps: true
});

export const Resource= model("Resource",resourceSchema)
