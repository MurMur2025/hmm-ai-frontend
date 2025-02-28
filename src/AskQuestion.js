import React, { useState } from "react";
import axios from "axios";

const AskQuestion = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post("https://hmm-ai-backend.onrender.com/api/ask", { question });
      setResponse(res.data.response);
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse("An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Ask a Question</h2>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question..."
        style={{ width: "300px", padding: "10px", marginRight: "10px" }}
      />
      <button onClick={handleAsk} disabled={loading} style={{ padding: "10px" }}>
        {loading ? "Loading..." : "Ask"}
      </button>
      {response && (
        <div style={{ marginTop: "20px", textAlign: "left", maxWidth: "600px", margin: "auto" }}>
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default AskQuestion;

