import mongoose from "mongoose";
import { TodoModel } from "../models/todoSchema.js";

// Connection state logging (shows when the DB dies / comes back)
mongoose.connection.on("connected", () => console.log("connected"));
mongoose.connection.on("open", () => console.log("open"));
mongoose.connection.on("disconnected", () => console.log("disconnected"));
mongoose.connection.on("reconnected", () => console.log("reconnected"));
mongoose.connection.on("disconnecting", () => console.log("disconnecting"));
mongoose.connection.on("close", () => console.log("close"));

async function addToDb(task, isDone = false) {
  const Todo = new TodoModel({ task, isDone });
  return await Todo.save();
}

async function delFromDb(id) {
  const ObjectId = new mongoose.Types.ObjectId(id);
  return await TodoModel.deleteOne({ _id: ObjectId });
}

async function editTask(id, task) {
  const ObjectId = new mongoose.Types.ObjectId(id);
  return await TodoModel.findOneAndUpdate({ _id: ObjectId }, { task });
}

async function updateCompletion(id) {
  const ObjectId = new mongoose.Types.ObjectId(id);
  const c = await TodoModel.findById(ObjectId);
  return await TodoModel.findOneAndUpdate({ _id: ObjectId }, { isDone:!c.isDone });
}

async function connectDB(url) {
  try {
    await mongoose.connect(url, { serverSelectionTimeoutMS: 5000 }); // fail in 5s instead of 30s
    return "MongoDB connected";
  } catch (error) {
    return `MongoDB connection failed: ${error}`;
  }
}

async function read(page = 1) {
  const limit = 10;
  const skip = (page - 1) * limit;
  const todos = await TodoModel.find({})
    .sort({ _id: -1 })
    .skip(skip)
    .limit(11)
    .lean();

  const hasMore = todos.length > 10;

  return {
    todos: todos.slice(0, 10),
    hasMore,
  };
}

export {
  addToDb,
  delFromDb,
  editTask,
  updateCompletion,
  connectDB,
  read,
};