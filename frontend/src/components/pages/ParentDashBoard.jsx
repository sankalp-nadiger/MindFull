import React, { useEffect, useState } from "react";

const ParentStudentDetails = ({ parentId }) => {
  const [sessions, setSessions] = useState([]);
  const [journals, setJournals] = useState([]);
  const [issues, setIssues] = useState([]);
  const [report, setReport] = useState(null);

  // Fetch Sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/parent/parent_Id/sessions`);
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
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/parent/parent/${parentId}/journals`);
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
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/parent/parent/${parentId}/issues`);
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
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/parent/parent/${parentId}/report`);
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
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-800 to-black text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        

        <div className="grid gap-6">
          {/* Sessions Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Sessions</h3>
            <ul className="space-y-2">
              {sessions.map((session) => (
                <li key={session._id} className="border-b border-gray-600 pb-2">
                  {session.student.name} - {session.counselor.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Journals Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Journals</h3>
            <ul className="space-y-2">
              {journals.map((journal) => (
                <li key={journal._id} className="border-b border-gray-600 pb-2">{journal.content}</li>
              ))}
            </ul>
          </div>

          {/* Issues Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Issues</h3>
            <ul className="space-y-2">
              {issues.map((issue) => (
                <li key={issue._id} className="border-b border-gray-600 pb-2">{issue.description}</li>
              ))}
            </ul>
          </div>

          {/* Report Section */}
          {report && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Student Report</h3>
              <p className="text-lg font-medium">Parent Name: {report.parentName}</p>
              <ul className="mt-4 space-y-2">
                {report.reports.map((r) => (
                  <li key={r.studentName} className="border-b border-gray-600 pb-2">
                    {r.studentName}: <span className="font-semibold">Avg Mood:</span> {r.avgMood}, 
                    <span className="font-semibold"> Journals:</span> {r.totalJournals}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentStudentDetails;
