import { useState,useEffect } from "react";
import "../CSS/Chatbox.css";
import { io } from "socket.io-client";

const socket=io("https://question-polling-app.onrender.com",{
  withCredentials: true
});



const Chatbox = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (input.trim()) {
            const msgObj = { user_id:sessionStorage.getItem("id"),user_name: sessionStorage.getItem("name"), description: input };
            socket.emit("chat message",msgObj);
            setInput("");
        }
    };


    const get_chat_data=()=>{

    }



    useEffect(()=>{
        socket.on("chat message",(message)=>{
            setMessages((prev) => [...prev, message]);
        })

        return () => {
            socket.off("chat message");
        };
    },[])

    return (
        <div className="chatbox-container">
            <div className="chat-header">
                <span className="active-tab">Chat</span>
                <span>Participants</span>
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-bubble ${msg.user === "User 1" ? "left" : "right"}`}
                    >
                        <span className="username">{msg.user_name}</span>
                        <p className="message-text">{msg.description}</p>
                    </div>
                ))}
            </div>

            <div className="chat-input-container">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chatbox;
