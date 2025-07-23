import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userrouter from "./routes/user_routes.js";
import { Server } from "socket.io";
import http from "http";
import { supabase } from "./connection/supabase_connection.js";
import teacherroute from "./routes/teacher_routes.js";


dotenv.config();
const port=process.env.PORT ?? 3000;

const app=express();
const server=http.createServer(app)
const io=new Server(server,{
  cors: {
    origin: ["http://localhost:5173", "https://illustrious-dragon-77f03d.netlify.app"],
    methods: ["GET", "POST"]
  }
});

let answers={};
let timer = null;

app.use(cors({"origin":["http://localhost:5173","https://illustrious-dragon-77f03d.netlify.app"]}))
app.use(express.json()); 

app.get("/",(req,res)=>{
    res.send({"message":"This is the Node API"});
})


app.get("/teacher/remove/:id", async (req, res) => {
  const userId = req.params.id;
  
  // Update DB to mark user as removed
  const {error}= await supabase.from("users").delete("*").eq("id",userId);
  if(error){
    return res.json({"status":"error",error});
  }
  res.json({ success: true });
});


app.use("/user",userrouter);

app.use("/teacher",teacherroute);


io.on("connection", (socket) => {


  socket.on("chat message", async(msg) => {
    // console.log("Message received:", msg);
    const {error}=await supabase.from("chat").insert(msg);
    if(error){
        console.log(error);
    }
    io.emit("chat message", msg);
  });


  socket.on("new-question",(question)=>{
    let time=question.timeLimit;
    answers = {}; 
    clearTimeout(timer);
    timer=setTimeout(()=>{
        console.log(answers);
        io.emit("question-result",answers);
        answers = {};
    },time*1000)
    io.emit("new-question",question);
  })

  socket.on("submit-question",(anser)=>{
    let selectedAnser=anser.user_anser;
    if(!answers[selectedAnser]){
        answers[selectedAnser]=1;
    }
    else{
        answers[selectedAnser]+=1;
    }
  })

  

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port,()=>{
    console.log("Server Started at port :"+port);
})