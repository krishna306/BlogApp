const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser")
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postsRoutes")
require("./connection");


app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json({extended:true}));
app.use("/users",userRoutes);
app.use("/posts",postRoutes);
const port =  process.env.PORT || 8000;

app.listen(port,function(){
    console.log(`Server Running on Port ${port}`);
});
app.get("/",(req,res)=>{
    res.send("Running");
})
