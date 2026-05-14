import express from "express";
import cors from "cors";
import bodyParser from "body-parser" ;
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postsRoutes.js"
import  "./connection.js";
const app = express();

app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json({extended:true}));
app.use("/users",userRoutes);
app.use("/posts",postRoutes);
const port =  process.env.PORT || 8080;

app.listen(port,function(){
    console.log(`Server Running on Port ${port}`);
});
app.get("/",(req,res)=>{
    res.send("Running");
})
