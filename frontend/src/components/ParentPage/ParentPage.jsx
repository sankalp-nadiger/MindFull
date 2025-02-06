"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

function ParentDashboard({ parentId }) {
  const navigate = useNavigate();
  const moodLabels = ["Not Logged In", "Angry", "Sad", "Anxious", "Tired", "Excited", "Happy"];
  const weekLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const [moodData, setMoodData] = useState(Array(7).fill(0));
  const [activityData, setActivityData] = useState(Array(7).fill(0));
  const [sessions, setSessions] = useState([]);
  const [journals, setJournals] = useState([]);
  const [issues, setIssues] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
      console.error("Access token is missing");
      return;
    }

    const fetchData = async () => {
      try {
        const urls = [
          { key: "mood", url: "/api/parent/week-mood-chart" },
          { key: "sessions", url: `/api/parent/parent/sessions` },
          { key: "journals", url: `/api/parent/parent/journals` },
          { key: "issues", url: `/api/parent/parent/issues` },
          { key: "report", url: `/api/parent/parent/report` },
        ];

        const requests = urls.map(({ url }) =>
          fetch(`http://localhost:8000${url}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }).then((res) => res.json())
        );

        const [moodRes, sessionsRes, journalsRes, issuesRes, reportRes] = await Promise.all(requests);
        console.log(journalsRes)
        if (moodRes.data) {
          setMoodData(moodRes.data.map((val) => (val !== null ? val + 1 : 0)));
          setActivityData(moodRes.activitiesCompleted || Array(7).fill(0));
        }
        setSessions(sessionsRes.sessions || []);
        if (journalsRes && journalsRes.journals) {
          console.log("Setting journals:", journalsRes.journals);
          setJournals(journalsRes.journals);
      } else {
          console.log("No journals found in response");
          setJournals([]);
      }
        setIssues(issuesRes.issues || []);
        setReport(reportRes.data || null);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [parentId]);

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-800 to-black text-white font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-gray-900 p-4 shadow-md">
        <h1 className="text-xl font-bold">Mindfull Parent Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Logout
        </button>
      </nav>

      {/* Main Dashboard */}
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center mb-6">Parent Dashboard</h2>

        <div className="flex items-center justify-center w-full gap-9 p-6 flex-wrap">
          <div className="flex items-center justify-center bg-gray-800 w-full max-w-sm p-6 rounded-lg shadow-lg text-center">
            <div className="w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Mood Analysis</h2>
              <Bar data={{ labels: weekLabels, datasets: [{ label: "Mood Score", data: moodData, backgroundColor: ["#808080", "#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#8E44AD", "#F39C12"], borderColor: "#ffffff", borderWidth: 1 }] }} 
                   options={{ plugins: { legend: { labels: { color: "white" } } }, scales: { x: { ticks: { color: "white" } }, y: { ticks: { color: "white", stepSize: 1, min: 0, max: moodLabels.length - 1, callback: (value) => moodLabels[value] || "" }, title: { display: true, text: "Mood Score", color: "white" } } } }} />
            </div>
          </div>

          <div className="flex items-center justify-center bg-gray-800 w-full max-w-sm p-6 rounded-lg shadow-lg text-center">
            <div className="w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Activity Tracking</h2>
              <Line data={{ labels: weekLabels, datasets: [{ label: "Activities Completed", data: activityData, fill: false, borderColor: "rgb(75, 192, 192)", tension: 0.1 }] }} 
                    options={{ plugins: { legend: { labels: { color: "white" } } }, scales: { x: { ticks: { color: "white" } }, y: { ticks: { color: "white", beginAtZero: true } } } }} />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6">
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

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
    <h3 className="text-2xl font-semibold mb-4">Journals</h3>
    {journals.length > 0 ? (
        <ul className="space-y-4">
            {journals.map((journal) => (
                <li key={journal._id} className="border-b border-gray-600 pb-4">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-medium text-blue-400">
                            {journal.topic || "Untitled Entry"}
                        </h4>
                        <span className="text-sm text-gray-400">
                            {new Date(journal.entryDate).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">
                        {journal.entryText}
                    </p>
                    {journal.moodScore && (
                        <div className="mt-2 text-sm text-gray-400">
                            Mood Score: {journal.moodScore}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    ) : (
        <p className="text-gray-400">No journal entries found.</p>
    )}
</div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Issues</h3>
              <ul className="space-y-2">
                {issues.map((issue) => (
                  <li key={issue._id} className="border-b border-gray-600 pb-2">
                    {issue.description}
                  </li>
                ))}
              </ul>
            </div>

            {report ? (
              <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-4">Student Report</h3>
                <p className="text-lg font-medium">Parent Name: {report.parentName || "N/A"}</p>
                <p className="text-lg font-medium">Student Name: {report.studentName || "N/A"}</p>
                <p><span className="font-semibold">Avg Mood:</span> {report.avgMood || "N/A"}</p>
                <p><span className="font-semibold">Journals:</span> {report.totalJournals || "N/A"}</p>
              </div>
            ) : <p className="text-gray-500">No report available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard;
