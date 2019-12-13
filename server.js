const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const methodOverride = require('method-override');


// DB config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// EJS files
app.set("view engine", "ejs");
app.use(methodOverride('_method'));
// Use routes
app.use('/api/todos', require('./routes/api/todos'));


const port = process.env.PORT || 2828;
app.listen(port, () => console.log(`Server running on port ${port}`));
