const mongoose = require('mongoose');
const Schema = mongoose.Schema

// Create Schema
const TodoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date,
  },
  files: [String]
});

module.exports = Todo = mongoose.model('todo', TodoSchema);
