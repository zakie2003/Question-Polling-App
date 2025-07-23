import { useState } from "react";
import axios from "axios";



function Student(){
    let [name,setName]=useState("");

    const submitName=async()=>{
        const response= await axios.post("https://question-polling-app.onrender.com/user/add_user",{name});
        console.log(response.data.user_data);
        sessionStorage.setItem("id",response.data.user_data[0].id);
        sessionStorage.setItem("name",response.data.user_data[0].name);
        window.location="/student/poll";
    }

    return (
        <>
        <div className="polling-system-container">
            <div className="intervue-poll-tag">Intervue Poll</div>
            <h1 className="main-heading">Let's Get Started</h1>
            <p className="sub-heading">Enter Your User Name To Get Started</p>

            <div className="choices-container">
                <input className="input-bar" type="text" value={name} onChange={(e)=>{setName(e.target.value)}} placeholder="Enter Name:"/>
                <button className="continue-button" onClick={()=>submitName()} disabled={!name}>
                    Continue
                </button>
            </div>

        </div>
        </>
    )
}

export default Student;