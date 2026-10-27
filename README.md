# Todo App

A responsive to-do app built with React + Tailwind CSS (frontend) and Express + MongoDB (backend).

## Features

- Add, tick / untick and delete tasks, saved in MongoDB
- Auto-growing input field
- Toast messages for every action
- Auto-reconnect to the database with a Retry banner if it goes down

## Setup

```bash
cd frontend
npm i
node server.js
npm run dev
```

## API

| Endpoint            | Description                               |
| ------------------- | ----------------------------------------- |
| `/`                 | Connects to MongoDB                       |
| `/fetch/:page`      | Gets tasks, 10 per page, newest first     |
| `/add/:task`        | Adds a task                               |
| `/del/:id`          | Deletes a task                            |
| `/update/:id`       | Toggles a task's done status              |
| `/update/:id/:task` | Edits a task's text                       |


## Author
 
Mohammad Ahmad