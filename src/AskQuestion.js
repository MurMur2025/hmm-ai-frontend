import React, { useState } from "react";
import axios from "axios";

const AskQuestion = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleAsk = async () => {
    if (!question) return;

    setLoading(true);
    setSearching(true);
    setResponse(null);

    try {
      const res = await axios.post("https://hmm-ai-backend.onrender.com/api/ask", { question });
      const aiText = res.data.response;

      // Split response into sections based on double line breaks (formatting from AI)
      const sections = aiText.split("\n\n");

      // Identify key discussion point (assuming the last section contains the social media post)
      const discussionPoint = sections.find(section => section.includes("Suggested Post:")) || "No suggested post available.";
 
      // Structure the response
      setResponse({
        factBasedAnswer: sections[0] || "No answer available.",
        talkingPoints: sections.slice(1) || [],
        keyDiscussionPoint: discussionPoint
      });
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse({
        factBasedAnswer: "An error occurred. Please try again.",
        talkingPoints: [],
        keyDiscussionPoint: ""
      });
    }

    setLoading(false);
    setSearching(false);
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
        {loading ? "Searching..." : "Ask"}
      </button>

      {searching && (
        <p style={{ marginTop: "10px", fontStyle: "italic", color: "#555" }}>
          Searching for answers...
        </p>
      )}

      {response && (
        <div style={{ marginTop: "20px", textAlign: "left", maxWidth: "600px", margin: "auto", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h3 style={{ color: "#007BFF" }}>Fact-Based Answer:</h3>
          <p>{response.factBasedAnswer}</p>

          {response.talkingPoints.length > 0 && (
            <>
              <h4 style={{ color: "#28A745" }}>Key Talking Points:</h4>
              <ul>
                {response.talkingPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </>
          )}

          {response.keyDiscussionPoint && (
            <div style={{ marginTop: "20px", padding: "10px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #ccc" }}>
              <h4 style={{ color: "#E74C3C" }}>Suggested Social Media Post:</h4>
              <p style={{ fontStyle: "italic", fontSize: "14px", color: "#333" }}>
                "{response.keyDiscussionPoint}"
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(response.keyDiscussionPoint)}
                style={{ padding: "5px 10px", cursor: "pointer", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px" }}
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AskQuestion;

