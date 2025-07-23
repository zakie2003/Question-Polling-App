import { useState,useEffect } from "react";
import "../CSS/Teacher.css";
import {io} from "socket.io-client";
import AdminChatbox from "../components/admin_chabox";

const socket = io("https://question-polling-app.onrender.com",{
  withCredentials: true
});

function Teacher() {
    const [questionText, setQuestionText] = useState("");
    const [charCount, setCharCount] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [seconds,setSeconds]=useState(0);
    const MAX_CHARS = 100;
    const [loading,setLoading]=useState(false);
    const [timeLimit, setTimeLimit] = useState(60);
    const [options, setOptions] = useState([
        { id: "opt1", text: "" },
        { id: "opt2", text: "" }
    ]);
    const [correctOptionId, setCorrectOptionId] = useState(null);


    const handleAskQuestion=()=>{
        if(correctOptionId){
            const question_data = {
                questionText: questionText,
                timeLimit: timeLimit,
                options: options.map(opt => ({
                    id: opt.id,
                    text: opt.text,
                })),
                correct_id:correctOptionId,
            };

            socket.emit("new-question",question_data);
            setSeconds(timeLimit);
            setLoading(true);
            setTimeout(()=>{
                setLoading(false);
            },timeLimit*1000);
        }
        else{
            window.alert("Enter Corrrect Option");
        }
    }

    const handleQuestionChange = (e) => {
        const text = e.target.value;
        if (text.length <= MAX_CHARS) {
            setQuestionText(text);
            setCharCount(text.length);
        }
    };

    const handleOptionTextChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index].text = value;
        setOptions(newOptions);
    };



    const addOption = () => {
        const newId = `opt${options.length + 1}`;
        setOptions([...options, { id: newId, text: ""}]);
    };

    const askQuestion = () => {
        const questionData = {
            questionText: questionText,
            timeLimit: timeLimit,
            options: options.map(opt => ({
                id: opt.id,
                text: opt.text,
            }))
        };
        console.log("Asking Question:", questionData);

        setQuestionText("");
        setCharCount(0);
        setTimeLimit(60);
        setOptions([
            { id: "opt1", text: "" },
            { id: "opt2", text: "" }
        ]);
        setCorrectOptionId(null);
    };

    useEffect(() => {
        sessionStorage.setItem("name","admin");
        sessionStorage.setItem("id","1");
    if (!loading) return;

    const timer = setInterval(() => {
        setSeconds((prev) => {
        if (prev <= 1) {
            clearInterval(timer);
            setLoading(false);
            return 0;
        }
        return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timer);  
    }, [loading]);



    return(
        <>
        {loading && (<div>
            <h1>Waiting for Students to Submit Anser</h1>
            Time Left: {seconds}
        </div>)}
       {!loading && (<div className="teacher-container">
            <div className="header-section">
                <div className="intervue-poll-tag">Intervue Poll</div>
                <h1 className="main-heading">Let's Get Started</h1>
                <div className="question-header-row">
                    <div >
                        <select style={{border: "none",padding: "10px",
                            background: "linear-gradient(to right, #8a2be2, #9932cc)"}} className="time-limit-selector"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                        >
                            <option value={15}>15 seconds</option>
                            <option value={30}>30 seconds</option>
                            <option value={45}>45 seconds</option>
                            <option value={60}>60 seconds</option>
                        </select>
                        <span className="dropdown-arrow"></span>
                    </div>
                </div>
                <p className="sub-heading-teacher">
                    you'll have the ability to create and manage polls, ask questions, and monitor
                    your students' responses in real-time.
                </p>
            </div>

            <div className="question-input-section">
                <div className="textarea-wrapper">
                    <textarea
                        id="question-textarea"
                        className="text-area-input"
                        placeholder="Type your question here..."
                        rows="4"
                        value={questionText}
                        onChange={handleQuestionChange}
                    ></textarea>
                </div>
            </div>

            <div className="edit-options-section">
                <div className="options-header-row">
                    <h2 className="edit-options-heading">Edit Options</h2>
                    <h2 className="is-correct-heading">Is it Correct?</h2>
                </div>
                <div className="options-list">
                    {options.map((option, index) => (
                        <div key={option.id} className="option-item">
                            <span className="option-number">{index + 1}</span>
                            <input
                                type="text"
                                className="option-input"
                                placeholder={`Option ${index + 1}`}
                                value={option.text}
                                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                            />
                            <div className="correct-radio-group">
                                <input
                                type="radio"
                                name="correctOption"

                                onChange={() => setCorrectOptionId(option.id)} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <button className="submit-button" onClick={addOption}>
                    + Add More option
                </button>
            </div>

            <button
                className="floating-chat-button" onClick={() => setShowChat((prev) => !prev)}>
                Chat
            </button>


            <div className="ask-question-button-container ">
                <button className="submit-button" onClick={handleAskQuestion}>
                    Ask Question
                </button>
            </div>
        </div>)
        }

      {showChat && (
        <AdminChatbox
          userName={"Admin"}
          userId={"admin2003"}
          onClose={() => setShowChat(false)}
        />
      )}

        </>
    )
}

export default Teacher;