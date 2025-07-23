import { useState,useEffect } from "react";
import "../CSS/Chatbox.css";
import { io } from "socket.io-client";
import axios from "axios";

const socket=io("https://question-polling-app.onrender.com",{
  withCredentials: true
});



const AdminChatbox = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [showParticipant,setShowParticipant]=useState(false);
    const [users,setUsers]=useState([]);

    const sendMessage = () => {
        if (input.trim()) {
            const msgObj = { user_id:sessionStorage.getItem("id"),user_name: sessionStorage.getItem("name"), description: input };
            socket.emit("chat message",msgObj);
            setInput("");
        }
    };


    const get_messages = async () => {
    try {
        const response = await axios.get("http://localhost:3000/chat_message"); 
        setMessages([...response.data.data].reverse());
  
    } catch (err) {
        console.error("Error fetching messages", err);
    }
    };


    useEffect(()=>{
    get_messages();  
    },[])

    const remove_user=async(id)=>{
        const response =await axios.get(`https://question-polling-app.onrender.com/teacher/remove/${id}`);
        get_user_Data();
    }

    const get_user_Data=async()=>{
        const response=await axios.get("https://question-polling-app.onrender.com/teacher/get_users");
        setUsers(response.data.data);
    }



    useEffect(()=>{
        get_user_Data();
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
                <button onClick={()=>setShowParticipant(false)} style={{border: "none",padding: "10px",background: "linear-gradient(to right, #8a2be2, #9932cc)",color:"white"}}>Chat</button>
                <button onClick={()=>setShowParticipant(true)} style={{border: "none",padding: "10px",background: "linear-gradient(to right, #8a2be2, #9932cc)",color:"white"}}>Participants</button>
            </div>
            {!showParticipant &&(
            <>
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
            </>
            )}

            {
                showParticipant && (
                    <>
                        {users.map((user)=>(
                            <>
                            <h3 style={{float:"left"}} key={user.id}>{user.name} <button style={{border: "none",padding: "10px",background: "linear-gradient(to right, #8a2be2, #9932cc)",color:"white"}} onClick={()=>remove_user(user.id)}>Remove</button></h3>

                            </>
                        ))}
                    </>
                )
            }
        </div>
    );
};

export default AdminChatbox;
