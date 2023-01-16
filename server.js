import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/todo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Task has to have a title"],
  },
  description: {
    type: String,
    required: [true, "Task has to have a description"],
  },
  link: {
    type: String,
    required: [true, "Task has to have a link attached"],
  },
  tags: {
    type: Array,
    required: [true, "Task has to have tag(s) attached"],
  },
  dueDate: {
    type: Date,
    default: new Date().toDateString(),
  },
  assignee: {
    type: "String",
    required: [true, "Task has to have an assignee"],
  },
  column: {
    type: String,
    required: [true, "Task has to be assigned to a specific column"],
    // default: ,
  },
  comments: {
    type: Array,
    required: false,
  },
});

const Task = mongoose.model("Task", TaskSchema);
// __________________________________________________________________

// Write your endpoints below:
// TASKS
app.get("/tasks", async (req, res) => {
  const { assignee, column, tags, page, perPage } = req.query;

  const query = {
    ...(assignee && { title: new RegExp(assignee, "i") }),
    ...(column && { column: new RegExp(column, "i") }),
    ...(tags && { tags: new RegExp(tags, "i") }),
  };

  const PageParam = page || 1;
  const perPageParam = perPage || 20;

  try {
    const tasks = await Task.aggregate([
      { $match: query },
      { $skip: (Number(PageParam) - 1) * Number(perPageParam) },
      { $limit: +perPageParam },
      // {$lookup: {
      //   from: "",
      //   localField: "",
      //   foreignField: "_id",
      //   as: "",
      // }},
    ]);
    res.status(200).json({
      data: tasks,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.post("/tasks", async (req, res) => {
  const {
    title,
    description,
    link,
    tags,
    dueDate,
    assignee,
    column,
    comments,
  } = req.body;

  try {
    const task = await new Task({
      title,
      description,
      link,
      tags,
      dueDate,
      assignee,
      column,
      comments,
    }).save();
    res.status(201).json({
      data: task,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.put("tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const {
    title,
    description,
    link,
    tags,
    dueDate,
    assignee,
    column,
    comments,
  } = req.body;
  console.log(taskId);

  try {
    const task = await Task.findByIdAndUpdate(
      taskId,
      { title, description, link, tags, dueDate, assignee, column, comments },
      { new: true, runValidators: true }
    );
    res.status(201).json({
      data: task,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
