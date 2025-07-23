import { useState } from "react";
import "../CSS/Choice.css"; 

function Choice() {
    let [choice, setChoice] = useState("");

    const changeChoice = (value) => {
        setChoice(value);
    }

    const submitChoice = () => {
        if(choice){
            window.location=`/${choice}`;
        }
 
    }

    return (
        <div className="polling-system-container">
            <div className="intervue-poll-tag">Intervue Poll</div>
            <h1 className="main-heading">Welcome to the Live Polling System</h1>
            <p className="sub-heading">Please select the role that best describes you to begin using the live polling system</p>

            <div className="choices-container">
                <div
                    className={`choice-card ${choice === "student" ? "selected" : ""}`}
                    onClick={() => changeChoice("student")}
                >
                    <h2>I'm a Student</h2>
                    <p>Submit Anser of the Given Poll in the real time</p>
                </div>

                <div
                    className={`choice-card ${choice === "teacher" ? "selected" : ""}`}
                    onClick={() => changeChoice("teacher")}
                >
                    <h2>I'm a Teacher</h2>
                    <p>Submit answers and view live poll results in real-time.</p>
                </div>
            </div>

            <button
                className="continue-button"
                onClick={submitChoice}  
                disabled={!choice}  
            >
                Continue
            </button>
        </div>
    )
}

export default Choice;