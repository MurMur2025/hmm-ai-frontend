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
      console.log("Full AI Response:", JSON.stringify(res.data.response, null, 2));

      // Get the raw AI text. The backend now returns a string with the templated format.
      const rawResponse = res.data.response;
      const aiText =
        typeof rawResponse === "object" && rawResponse !== null && rawResponse.text
          ? rawResponse.text
          : rawResponse;
      console.log("AI Text:", aiText);

      // Use regex to extract sections based on the fixed headings.
      const misleadingStatementMatch = aiText.match(/### Misleading Statement:\s*([\s\S]*?)(?=###)/);
      const keyPointsMatch = aiText.match(/### Key Points:\s*([\s\S]*?)(?=###)/);
      const evidenceMatch = aiText.match(/### Verifiable Evidence:\s*([\s\S]*?)(?=###)/);
      const positiveSpinMatch = aiText.match(/### Positive Spin:\s*([\s\S]*?)(?=###)/);
      const suggestedPostMatch = aiText.match(/### Suggested Post:\s*"([\s\S]*?)"/);

      const misleadingStatement = misleadingStatementMatch
        ? misleadingStatementMatch[1].trim()
        : "N/A";

      // Extract key points by splitting on newlines and filtering bullet points.
      let keyPoints = [];
      if (keyPointsMatch) {
        keyPoints = keyPointsMatch[1]
          .split("\n")
          .filter(line => line.trim().startsWith("-"))
          .map(line => line.replace(/^- /, "").trim());
      }

      // Extract verifiable evidence (sources) in a similar way.
      let sources = [];
      if (evidenceMatch) {
        sources = evidenceMatch[1]
          .split("\n")
          .filter(line => line.trim().startsWith("-"))
          .map(line => line.replace(/^- /, "").trim());
      }

      const positiveSpin = positiveSpinMatch
        ? positiveSpinMatch[1].trim()
        : "N/A";
      const suggestedPost = suggestedPostMatch
        ? suggestedPostMatch[1].trim()
        : "N/A";

      setResponse({
        misleadingStatement,
        keyPoints,
        sources,
        positiveSpin,
        suggestedPost,
      });
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse({
        misleadingStatement: "An error occurred. Please try again.",
        keyPoints: [],
        sources: [],
        positiveSpin: "N/A",
        suggestedPost: "N/A",
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
        <div
          style={{
            marginTop: "20px",
            textAlign: "left",
            maxWidth: "600px",
            margin: "auto",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ color: "#E74C3C" }}>Misleading Statement:</h3>
          <p>{response.misleadingStatement}</p>

          <h3 style={{ color: "#007BFF" }}>Key Points:</h3>
          {response.keyPoints && response.keyPoints.length > 0 ? (
            <ul>
              {response.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          ) : (
            <p>No key points available.</p>
          )}

          <h3 style={{ color: "#28A745" }}>Verifiable Evidence:</h3>
          {response.sources && response.sources.length > 0 ? (
            <ul>
              {response.sources.map((source, index) => (
                <li key={index}>{source}</li>
              ))}
            </ul>
          ) : (
            <p>No verifiable evidence available.</p>
          )}

          <h3 style={{ color: "#FF8C00" }}>Positive Spin:</h3>
          <p>{response.positiveSpin}</p>

          {response.suggestedPost && response.suggestedPost !== "N/A" && (
            <div
              style={{
                marginTop: "20px",
                padding: "10px",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            >
              <h4 style={{ color: "#E74C3C" }}>Suggested Social Media Post:</h4>
              <p style={{ fontStyle: "italic", fontSize: "14px", color: "#333" }}>
                "{response.suggestedPost}"
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(response.suggestedPost)}
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  backgroundColor: "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
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

