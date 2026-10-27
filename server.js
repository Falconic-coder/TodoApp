import express from "express";
import cors from "cors";
import { connectDB, addToDb, delFromDb, updateCompletion, editTask, read } from "./database/tododb.js";

const app = express();
const port = 3000;
const url = "mongodb://localhost:27017/";

app.use(cors())

// Sends async errors (e.g. DB down) to the error handler below instead of crashing the server
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

app.get("/", (req, res) => {
  connectDB(url)
    .then((value) => res.send(value))
    .catch((error) => {
      res.send(error)
      process.exit(1)
    });
});


app.get("/add/:task/", wrap(async (req, res) => {
  const task = req.params.task;
  if (task !== "") {
    const doc = await addToDb(task);
    res.send(doc);
  }
}));

app.get("/del/:id/", wrap(async (req, res) => {
  const id = req.params.id;
  if (id !== "") {
    const doc = await delFromDb(id);
    res.send(doc);
  }
}));

app.get("/update/:id", wrap(async(req, res) => {
  const id = req.params.id;
  if (id !== "") {
    const doc = await updateCompletion(id);
    res.send(doc);
  }
})); 

app.get("/update/:id/:task", wrap(async(req, res) => {
  const id = req.params.id;
  const task = req.params.task;
  if (id !== "") {
    const doc = await editTask(id, task);
    res.send(doc);
  }
})); 

app.get("/fetch/:page", wrap(async(req, res) => {
  const docs = await read(parseInt(req.params.page.trim()));
  res.send(docs);
}));

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).send(err.message);
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});