import { supabase } from "../connection/supabase_connection.js";
import {v4 as uuidv4} from "uuid";
import dotenv from "dotenv";

dotenv.config(); 

export const add_user=async(req,res)=>{
    const {name}=req.body;
    const {data,error}=await supabase.from("users").insert({name:name}).select('id, name');;
    if(error){
        return res.json({status:"error",error:error});
    }
    return res.json({status:"success","user_data":data})
}

export const check_status = async (req, res) => {
  const userId = req.query.id;
  console.log(userId);
  if (!userId || userId === "undefined") {
    return res.json({ isRemoved: true, status: "error", message: "Invalid or missing user ID" });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")  // must match Supabase column name exactly
    .eq("id", userId)
    .single();

  if (!data) {
    return res.json({ isRemoved: true });
  }

  if (error) {
    console.error("Supabase error:", error);
    return res.json({ status: "error", message: error.message });
  }

 
  res.json({ isRemoved: false});
};
