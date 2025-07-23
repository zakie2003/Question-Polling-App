import express from "express";
import { add_user } from "../controller/user_controller.js";
import { check_status } from "../controller/user_controller.js";
const userrouter=express.Router();


userrouter.post("/add_user",add_user);
userrouter.get("/status",check_status);

export default userrouter;