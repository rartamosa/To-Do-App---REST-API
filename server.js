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
  },
});

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tag has to have a title"],
  },
  color: {
    type: String,
    required: [true, "Tag has to have a color assigned"],
  },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User has to have a name"],
  },
  description: {
    type: String,
    required: [true, "User has to have a description"],
  },
  imageURL: {
    type: String,
    required: [true, "User has to have an avatar"],
  },
});

const ColumnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "To Do",
  },
});

const Task = mongoose.model("Task", TaskSchema);
const Tag = mongoose.model("Tag", TagSchema);
const User = mongoose.model("User", UserSchema);
const Column = mongoose.model("Column", ColumnSchema);

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

app.put("/tasks/:taskId", async (req, res) => {
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
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

// TAGS
app.get("/tags", async (req, res) => {
  try {
    const tags = await Tag.find({});
    res.status(200).json({
      data: tags,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.post("/tags", async (req, res) => {
  const { name, color } = req.body;
  try {
    const tag = await new Tag({ name, color }).save();
    res.status(201).json({
      data: tag,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.put("/tags/:tagId", async (req, res) => {
  const { tagId } = req.params;
  const { name, color } = req.body;

  try {
    const tag = await Tag.findByIdAndUpdate(
      tagId,
      { name, color },
      { new: true, runValidators: true }
    );
    res.status(201).json({
      data: tag,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

// USERS
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      data: users,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

// v1
app.post("/users", async (req, res) => {
  const { name, description, imageURL } = req.body;

  try {
    const user = await new User({ name, description, imageURL }).save();
    res.status(201).json({
      data: user,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

// v2

//  v1
app.put("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name, description, imageURL } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, description, imageURL },
      { new: true, runValidators: true }
    );
    res.status(201).json({
      data: user,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

// v2

// COLUMNS
app.get("/columns", async (req, res) => {
  try {
    const column = await Column.find({});
    res.status(200).json({
      data: column,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.post("/columns", async (req, res) => {
  const { name } = req.body;

  try {
    const column = await new Column({ name }).save();
    res.status(201).json({
      data: column,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.put("/columns/:columnId", async (req, res) => {
  const { columnId } = req.params;
  const { name } = req.body;

  try {
    const column = await Column.findByIdAndUpdate(
      columnId,
      { name },
      { new: true, runValidators: true }
    );
    res.status(201).json({
      data: column,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
