import React, { useState } from "react";
import axios from "axios";

const GenerateReports = () => {
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setMessage("");

    try {
      const userId =req._id// Assuming userId is stored in localStorage
      if (!userId) {
        setMessage("User ID not found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:8000/api/generate-report", {
        params: { userId },
      });

      setReport(response.data.report);
      setMessage("Report generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      setMessage("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Generate Mood & Journal Report</h2>
      <button onClick={handleGenerateReport} disabled={loading}>
        {loading ? "Generating..." : "Generate Report"}
      </button>
      {message && <p>{message}</p>}
      {report && (
        <div>
          <h3>Report Details:</h3>
          <p><strong>Name:</strong> {report.name}</p>
          <p><strong>Email:</strong> {report.email}</p>
          <p><strong>Average Mood:</strong> {report.avgMood}</p>
          <p><strong>Total Journals:</strong> {report.totalJournals}</p>
          <p><strong>Generated At:</strong> {new Date(report.generatedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default GenerateReports;
