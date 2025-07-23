import express from "express";
import { get_users } from "../controller/teacher_controller.js";

const teacherroute=express.Router();

teacherroute.get("/get_users",get_users);


export default teacherroute;