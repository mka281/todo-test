const express = require("express");
const moment = require("moment");
const router = express.Router();
const upload = require('../../config/aws/awsConfig').upload
const s3 = require('../../config/aws/awsConfig').s3
const bucketName = require('../../config/aws/awsConfig').bucketName

// Load Todo model
const Todo = require("../../models/Todo");

/**
 * TEST
 */

// @route   GET api/posts/test
// @desc    Tests todo route
// @access  Public
router.get("/test", (req, res) => res.json({
  msg: "Todo Works"
}));


/**
 * TODO ROUTES
 */

// @route   GET api/todos
// @desc    Get all todos
// @access  Public
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find().sort({
      date: -1
    })
    // console.log(todos)
    // res.json(todos)
    res.render('index', { todos: todos, moment: moment })
  } catch (err) {
    console.log(err)
    res.status(404).json({
      notodofound: "No todos found"
    })
  }
});

// @route   POST api/todos
// @esc     Create a todo
// @access  Public
router.post("/", async (req, res) => {
  try {
    const newTodo = new Todo({
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate || '10/10/2020'
    });
    const todo = await newTodo.save()
    res.json(todo)
    // res.render('index')
  } catch (err) {
    console.log(err)
    res.status(404).json({
      notodofound: "No todos found"
    })
  }
});


// @route   GET api/todos/:id
// @desc    Get todo by id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)
    res.json(todo)
  } catch (err) {
    res.status(404).json({
      notodofound: "No todo found with that ID"
    })
  }
});


// @route   PUT api/todos/:id
// @desc    Change todo info (title, desc, dueDate)
// @access  Public
router.put("/:id", async (req, res) => {
  try {
    const { title, description, dueDate } = req.body
    const todo = await Todo.findById(req.params.id)
    todo.title = title
    todo.description = description
    todo.dueDate = dueDate
    const updatedTodo = await todo.save()
    res.json(updatedTodo)
  } catch (err) {
    res.status(404).json({
      updateNotSuccessful: "Todo could not be updated"
    })
  }
});

// @route   PUT api/todos/:id/toggleCompleted
// @desc    Change todo completed status
// @access  Public
router.put("/:id/toggleCompleted", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)
    todo.isCompleted = !todo.isCompleted
    const updatedTodo = await todo.save()
    res.json(updatedTodo)
  } catch (err) {
    res.status(404).json({
      updateNotSuccessful: "Todo status could not be updated"
    })
  }
});

// @route   DELETE api/todos/:id
// @desc    Delete todo by id
// @access  Public
router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)
    await todo.remove()
    res.json({
      success: true
    })
  } catch (err) {
    res.status(404).json({
      deleteNotSuccessful: "No post found"
    })
  }
});


/**
 * TODO FILES ROUTES
 */

// @route   POST api/todos/:id/file
// @desc    Add file to todo
// @access  Public
router.post("/:id/file", async (req, res) => {
  try {
      const singleUpload = upload.single('file')
      await singleUpload(req, res, async err => {
          if (err) console.log(err, err.stack)
          
          // Add filename to files array in Todo Model
          const filename = req.file.key
          const todo = await Todo.findById(req.params.id)
          todo.files.push(filename);
          const updatedTodo = await todo.save()
          
          // return new todo model
          res.json(updatedTodo)
      })
  } catch (err) {
      console.log(err.stack)
      res.status(404).json({
        uploadNotSuccessful: "File could not be attached to todo item"
      })
  }
});

// @route   GET api/todos/:id/file/:filename
// @desc    View the file
// @access  Public
router.get("/:id/file/:filename", async (req, res) => {
  try {
      const s3Params = {
          Bucket: bucketName,
          Key: req.params.filename
      }
      const data = await s3.getObject(s3Params).promise()
      res.end(data.Body)
  } catch (err) {
      res.status(404).json({
          fileNotound: "File could not be found or retrieved from AWS"
      })
  }
});

// @route   DELETE api/todos/:id/file/:filename
// @desc    Add file to todo
// @access  Public
router.delete("/:id/file/:filename", async (req, res) => {
  try {
      const { filename } = req.params 
      const params = {
          Bucket: bucketName, 
          Key: filename
      };
      await s3.deleteObject(params).promise()

      // Add filename to files array in Todo Model
      const todo = await Todo.findById(req.params.id)
      todo.files = todo.files.filter(i => i !== filename)
      const updatedTodo = await todo.save()
      
      // return new todo model
      res.json(updatedTodo)
  } catch (err) {
      console.log(err.stack)
      res.status(404).json({
          deleteNotSuccessful: "File could not be deleted"
      })
  }
});

module.exports = router;