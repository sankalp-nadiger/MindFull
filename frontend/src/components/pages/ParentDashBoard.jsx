import React, { useEffect, useState } from "react";

const ParentDashboard = ({ parentId }) => {
  const [sessions, setSessions] = useState([]);
  const [journals, setJournals] = useState([]);
  const [issues, setIssues] = useState([]);
  const [report, setReport] = useState(null);

  // Fetch Sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/parent/parent_Id/sessions`);
      if (!response.ok) throw new Error("Failed to fetch sessions");
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      alert(error.message);
    }
  };

  // Fetch Journals
  const fetchJournals = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/parent/parent/${parentId}/journals`);
      if (!response.ok) throw new Error("Failed to fetch journals");
      const data = await response.json();
      setJournals(data.journals);
    } catch (error) {
      alert(error.message);
    }
  };

  // Fetch Issues
  const fetchIssues = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/parent/parent/${parentId}/issues`);
      if (!response.ok) throw new Error("Failed to fetch issues");
      const data = await response.json();
      setIssues(data.issues);
    } catch (error) {
      alert(error.message);
    }
  };

  // Fetch Student Report
  const fetchStudentReport = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/parent/parent/${parentId}/report`);
      if (!response.ok) throw new Error("Failed to fetch student report");
      const data = await response.json();
      setReport(data);
    } catch (error) {
      alert(error.message);
    }
  };

  // Load all data when the component mounts
  useEffect(() => {
    fetchSessions();
    fetchJournals();
    fetchIssues();
    fetchStudentReport();
  }, [parentId]);

  return (
    <div>
      <h2>Parent Dashboard</h2>

      <h3>Sessions</h3>
      <ul>
        {sessions.map((session) => (
          <li key={session._id}>
            {session.student.name} - {session.counselor.name}
          </li>
        ))}
      </ul>

      <h3>Journals</h3>
      <ul>
        {journals.map((journal) => (
          <li key={journal._id}>{journal.content}</li>
        ))}
      </ul>

      <h3>Issues</h3>
      <ul>
        {issues.map((issue) => (
          <li key={issue._id}>{issue.description}</li>
        ))}
      </ul>

      {report && (
        <div>
          <h3>Student Report</h3>
          <p>Parent Name: {report.parentName}</p>
          <ul>
            {report.reports.map((r) => (
              <li key={r.studentName}>
                {r.studentName}: Avg Mood: {r.avgMood}, Journals: {r.totalJournals}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
