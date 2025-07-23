import { useState, useEffect, useRef } from "react";
import "../CSS/Teacher.css";
import { io } from "socket.io-client";
import AdminChatbox from "../components/admin_chabox";
import axios from "axios";

// Initialize socket
const socket = io("https://question-polling-app.onrender.com", {
  withCredentials: true
});

function Teacher() {
  const [questionText, setQuestionText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [options, setOptions] = useState([
    { id: "opt1", text: "" },
    { id: "opt2", text: "" }
  ]);
  const [correctOptionId, setCorrectOptionId] = useState(null);
  const [results, setResults] = useState(null);
  const [lastQuestion, setLastQuestion] = useState(null);

  const MAX_CHARS = 100;
  const currentQuestionRef = useRef(null); // ✅ Keeps track of the latest question for result saving

  const handleAskQuestion = () => {
    if (!correctOptionId) {
      window.alert("Enter Correct Option");
      return;
    }

    // Prepare question data
    const question_data = {
      questionText,
      timeLimit,
      options: options.map(opt => ({
        id: opt.id,
        text: opt.text,
      })),
      correct_id: correctOptionId,
    };

    // Store in ref to access later
    currentQuestionRef.current = question_data;

    // Emit socket event
    socket.emit("new-question", question_data);

    setResults(null);
    setLastQuestion(null);
    setSeconds(timeLimit);
    setLoading(true);

    // Stop loading after time is up
    setTimeout(() => {
      setLoading(false);
    }, timeLimit * 1000);
  };

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
    setOptions([...options, { id: newId, text: "" }]);
  };

  useEffect(() => {
    sessionStorage.setItem("name", "admin");
    sessionStorage.setItem("id", "1");

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

  useEffect(() => {
    socket.on("question-result", async (data) => {
      const questionData = currentQuestionRef.current;

      if (!questionData) return;

      setResults(data);
      setLastQuestion({
        questionText: questionData.questionText,
        options: questionData.options
      });

      try {
        await axios.post("http://localhost:3000/teacher/save-poll-result", {
          questionText: questionData.questionText,
          options: questionData.options,
          results: data,
          correctOptionId: questionData.correct_id
        });
        setQuestionText("");
        setCorrectOptionId(null);
        setOptions([
          { id: "opt1", text: "" },
          { id: "opt2", text: "" },
        ]);
      } catch (err) {
        console.error("Failed to save poll result:", err);
      }

      setLoading(false);
    });

    return () => {
      socket.off("question-result");
    };
  }, []);

  return (
    <>
      {loading && (
        <div>
          <h1>Waiting for Students to Submit Answer</h1>
          Time Left: {seconds}
        </div>
      )}

      {!loading && !results && (
        <div className="teacher-container">
          <div className="header-section">
            <div className="intervue-poll-tag">Intervue Poll</div>
            <h1 className="main-heading">Let's Get Started</h1>
            <div className="question-header-row">
              <select
                className="time-limit-selector"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              >
                {[15, 30, 45, 60].map((val) => (
                  <option key={val} value={val}>{val} seconds</option>
                ))}
              </select>
            </div>
            <p className="sub-heading-teacher">
              You'll have the ability to create and manage polls, ask questions, and monitor
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
                      checked={correctOptionId === option.id}
                      onChange={() => setCorrectOptionId(option.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="submit-button" onClick={addOption}>
              + Add More Option
            </button>
          </div>

          <button className="floating-chat-button" onClick={() => setShowChat((prev) => !prev)}>
            Chat
          </button>

          <div className="ask-question-button-container">
            <button className="submit-button" onClick={handleAskQuestion}>
              Ask Question
            </button>
          </div>
        </div>
      )}

      {results && lastQuestion && (
        <div className="results-summary">
          <h2 className="results-heading">Poll Results for: "{lastQuestion.questionText}"</h2>
          <div className="results-options-list">
            {lastQuestion.options.map((option) => {
              const key = option.id;
              const votes = results?.[key] || 0;
              const totalVotes = Object.values(results || {}).reduce((a, b) => a + b, 0);
              const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              const isCorrect = key === correctOptionId;

              return (
                <div key={key} className={`result-item ${isCorrect ? "correct-answer" : ""}`}>
                  <div className="result-label">
                    <span className="result-option-text">{option.text}</span>
                    <span className="result-votes">
                      {votes} vote(s) — {percent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: isCorrect ? "#4caf50" : "#8a2be2",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              className="submit-button"
              onClick={() => {
                setResults(null);
                setLastQuestion(null);
                setQuestionText("");
                setCorrectOptionId(null);
                setOptions([
                  { id: "opt1", text: "" },
                  { id: "opt2", text: "" },
                ]);
              }}
            >
              Ask Another Question
            </button>
          </div>
        </div>
      )}

      {showChat && (
        <AdminChatbox
          userName={"Admin"}
          userId={"admin2003"}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}

export default Teacher;
