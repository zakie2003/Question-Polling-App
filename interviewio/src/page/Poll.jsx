import { useState, useEffect } from "react";
import Spinner from "../components/spinner";
import Chatbox from "../components/chatbox";
import { io } from "socket.io-client";
import "../CSS/Poll.css";
import axios from "axios";

const socket = io("https://question-polling-app.onrender.com",{
  withCredentials: true
});

const Poll = () => {
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [lastQuestion, setLastQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [results, setResults] = useState(null);
  const [messages, setMessages] = useState([]);

  const userName = sessionStorage.getItem("name") || "Guest";
  const userId = sessionStorage.getItem("id");


  useEffect(() => {
  const userId = sessionStorage.getItem("id");
  if (userId) {
    socket.emit("register", userId);
  }
}, []);


useEffect(() => {
  const interval = setInterval(async () => {
    const res = await axios.get(`https://question-polling-app.onrender.com/user/status?id=${userId}`);

console.log("Server Response",res.data);
    if (res.data.isRemoved) {
      alert("You have been removed from the quiz.");
      sessionStorage.clear();
      window.location="/removed";
    }
  }, 5000);  

  return () => clearInterval(interval);
}, []);


  useEffect(() => {
    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("new-question", (question) => {
      console.log("New Question Received:", question);
      setCurrentQuestion(question);
      setLastQuestion(null);
      setTimeLeft(question.timeLimit || 15);
      setLoading(false);
      setResults(null);
      setSelectedAnswer(null);
    });

    socket.on("question-result", (data) => {
        console.log("Results received:", data);
        setResults(data);
        setLoading(false);
        setLastQuestion(currentQuestion);
        setCurrentQuestion(null);
        setTimeLeft(0);
    });

    socket.on("timer-update", (remainingTime) => {
        setTimeLeft(remainingTime);
        if (remainingTime <= 0 && currentQuestion) {
            console.log("Server signaled timer ended.");
            handleSubmit();
        }
    });

    socket.on("waiting-for-question", () => {
        console.log("Waiting for question from teacher...");
        setLoading(true);
        setCurrentQuestion(null);
        setResults(null);
        setSelectedAnswer(null);
        setLastQuestion(null);
        setTimeLeft(0);
    });

    return () => {
      socket.off("receive-message");
      socket.off("new-question");
      socket.off("question-result");
      socket.off("timer-update");
      socket.off("waiting-for-question");
    };
  }, [currentQuestion]);

  useEffect(() => {
    let countdownInterval;
    if (currentQuestion && timeLeft > 0) {
      countdownInterval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (currentQuestion && timeLeft === 0) {
        console.log("Client-side timer reached 0.");
        handleSubmit();
    }
    return () => clearInterval(countdownInterval);
  }, [currentQuestion, timeLeft]);

  const handleOptionSelect = (optionId) => {
    if (timeLeft > 0) {
      setSelectedAnswer(optionId);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer && timeLeft > 0) {
      alert("Please select an answer before submitting.");
      return;
    }

    console.log("Submitting answer:", selectedAnswer, "for question:", currentQuestion?.id);

    socket.emit("submit-question", {
      questionId: currentQuestion?.id,
      user_anser: selectedAnswer,
      userId: userId,
      userName: userName
    });

    setLoading(true);
    setSelectedAnswer(null);
  };

  return (
    <div className="poll-screen-container">
      <div className="intervue-poll-tag">Intervue Poll</div>

      {loading && !currentQuestion && !results && (
        <div className="waiting-state">
          <Spinner loading={loading} />
          <h1 className="main-heading">Wait for the teacher to ask questions..</h1>
        </div>
      )}

      {!loading && currentQuestion && (
        <div className="question-state">
          <div className="question-header">
            <span className="question-number">Question 1</span>
          </div>

          <div className="question-card">
            <p className="question-text">{currentQuestion.questionText}</p>
          <div className="options-container">
        {currentQuestion.options.map((option, index) => {
          const key = option?.id ?? option?.text;
          const votes = results?.[key] || 0;
          const totalVotes = Object.values(results || {}).reduce((a, b) => a + b, 0);
          const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

          return (
            <div
              key={key}
              className={`option-card ${selectedAnswer === option.id ? "selected" : ""}`}
              onClick={() => timeLeft > 0 && handleOptionSelect(option.id)}
              style={timeLeft === 0 ? { pointerEvents: 'none', opacity: 1 } : {}}
            >
              <span className="option-number">{index + 1}</span>
              <span className="option-text">{option.text}</span>

            </div>
          );
        })}

          </div>

          </div>

          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!selectedAnswer || timeLeft === 0}
          >
            Submit
          </button>
        </div>
      )}

      {!results && (
      <div>
          <svg className="timer-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-.22-13.33L8.06 9.4l-.88 1.43 4.4 2.87.5-3.03z"/>
          </svg>
          <span className="time-left">
              {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
              {String(timeLeft % 60).padStart(2, "0")}
            </span>
      </div>
      )}

      {results && lastQuestion && (
        <div className="results-summary">
          <h2 className="results-heading">Poll Results for: "{lastQuestion.questionText}"</h2>
          <div className="results-options-list">
            {lastQuestion.options.map((option) => {
              const key = option?.id ?? option?.text;
              const votes = results?.[key] || 0;
              const totalVotes = Object.values(results || {}).reduce((a, b) => a + b, 0);
              const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              const isCorrect = option.isCorrect;

              return (
                <div key={key} className={`result-item ${isCorrect ? 'correct-answer' : ''}`}>
                  <div className="result-label">
                    <span className="result-option-text">{option.text}</span>
                    <span className="result-votes">{votes} vote(s) — {percent.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: isCorrect ? '#4caf50' : '#8a2be2',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      <button
        className="floating-chat-button"
        onClick={() => setShowChat((prev) => !prev)}
      >
        Chat
      </button>

      {showChat && (
        <Chatbox
          userName={userName}
          userId={userId}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default Poll;