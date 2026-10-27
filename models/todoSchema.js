import mongoose from 'mongoose';
const { Schema } = mongoose;

const TodoSchema = new Schema({
  task: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
    default: false
  },
});

export const TodoModel = mongoose.model("Todo", TodoSchema)