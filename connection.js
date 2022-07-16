const mongoose = require("mongoose");
require('dotenv').config()
mongoose.connect("mongodb://localhost:27017/blogpost")
.then(console.log("connected to Database"))
.catch((err) => console.log(err));

// const uri = process.env.MongoURL;
// mongoose.connect(uri,{
//     useNewUrlParser:true,
//     useUnifiedTopology:true,
// }).then(()=>{
//     console.log("Connected to Database");
// }).catch((err) =>console.log(err));

module.exports = mongoose;