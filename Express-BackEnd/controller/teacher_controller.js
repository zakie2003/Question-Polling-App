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

export const save_pole=async (req, res) => {
  const { questionText, options, results } = req.body;
  try {
    const { data, error } = await supabase.from("poll_results").insert([
      {
        question_text: questionText,
        options: options,               
        correct_option_id: "opt1",
        results: results                
      }
    ]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      return res.status(500).json({ error: "Failed to save poll result" });
    }

    return res.status(200).json({ message: "Poll result saved", data });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export const get_save_polls=async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("poll_results")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch poll history" });
    }

    return res.json(data);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}