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

      // Extract structured sections from AI response
      const misleadingStatement = aiText.match(/\*\*Misinformation Identified\*\*:(.*?)(?=\*\*Correct Information\*\*|$)/s)?.[1]?.trim() || "No misleading statement found.";
      const correction = aiText.match(/\*\*Correct Information\*\*:(.*?)(?=\*\*Conclusion\*\*|$)/s)?.[1]?.trim() || "No correction available.";
      const keyPoints = aiText.match(/\*\*(.*?)\*\*:(.*?)(?=\*\*|$)/gs)?.map(point => point.trim()) || [];
      const conclusion = aiText.match(/\*\*Conclusion\*\*:(.*?)(?=\#\#\# Suggested Post|$)/s)?.[1]?.trim() || "No conclusion provided.";
      const suggestedPost = aiText.match(/### Suggested Post:\n"(.*?)"/s)?.[1]?.trim() || "No suggested post available.";

      // Structure the response
      setResponse({
        misleadingStatement,
        correction,
        keyPoints,
        conclusion,
        suggestedPost
      });
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse({
        misleadingStatement: "",
        correction: "An error occurred. Please try again.",
        keyPoints: [],
        conclusion: "",
        suggestedPost: ""
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
          <h3 style={{ color: "#E74C3C" }}>Misleading Statement:</h3>
          <p>{response.misleadingStatement}</p>

          <h3 style={{ color: "#007BFF" }}>Correction:</h3>
          <p>{response.correction}</p>

          {response.keyPoints.length > 0 && (
            <>
              <h3 style={{ color: "#28A745" }}>Key Points:</h3>
              <ul>
                {response.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </>
          )}

          <h3 style={{ color: "#FF8C00" }}>Conclusion:</h3>
          <p>{response.conclusion}</p>

          {response.suggestedPost && response.suggestedPost !== "No suggested post available." && (
            <div style={{ marginTop: "20px", padding: "10px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #ccc" }}>
              <h4 style={{ color: "#E74C3C" }}>Suggested Social Media Post:</h4>
              <p style={{ fontStyle: "italic", fontSize: "14px", color: "#333" }}>
                "{response.suggestedPost}"
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(response.suggestedPost)}
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

