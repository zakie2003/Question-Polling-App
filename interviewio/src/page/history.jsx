import { useEffect, useState } from "react";
import axios from "axios";
import "../CSS/History.css";

function History() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPollHistory = async () => {
      try {
        const res = await axios.get("http://localhost:3000/teacher/get-poll-result");
        setPolls(res.data);
      } catch (error) {
        console.error("Error fetching poll history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPollHistory();
  }, []);

  return (
    <div className="history-container">
      <h1>Poll History</h1>
      {loading ? (
        <p>Loading polls...</p>
      ) : polls.length === 0 ? (
        <p>No polls found.</p>
      ) : (
        polls.map((poll, index) => {
          const totalVotes = Object.values(poll.results || {}).reduce((a, b) => a + b, 0);

          return (
            <div key={index} className="poll-item">
              <h2>{poll.question_text}</h2>
              <ul className="options-list">
                {poll.options.map((opt) => {
                  const voteCount = poll.results?.[opt.id] ?? 0;
                  const percent = totalVotes ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
                  const isCorrect = opt.id === poll.correct_option_id;

                  return (
                    <li key={opt.id} className={`option-item ${isCorrect ? "correct" : ""}`}>
                        <div className="option-text">
                        <strong>{opt.text}</strong> — {voteCount} vote(s), {percent}%
                        </div>
                        <div className="progress-bar">
                        <div
                            className={`progress-fill ${isCorrect ? "correct-fill" : ""}`}
                            style={{ width: `${percent}%` }}
                        ></div>
                        </div>

                    </li>
                  );
                })}
              </ul>
              <hr />
            </div>
          );
        })
      )}
    </div>
  );
}

export default History;
