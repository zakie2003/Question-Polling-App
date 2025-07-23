import { supabase } from "../connection/supabase_connection.js";

import {v4 as uuidv4} from "uuid";

import dotenv from "dotenv";

dotenv.config(); 


export const get_users=async(req,res)=>{
    try{
        const {data,error}=await supabase.from("users").select("*")
        if(error){
            return res.json({"status":"error","message":error});
        }
        console.log(data);
        return res.json({status:"success",data:data})
    }
    catch(err){
        return res.json({"status":"error","message":err});
    }
}