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
          fetch(`${import.meta.env.VITE_BASE_API_URL}${url}`, {
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

        <div className="flex items-center justify-around h-full w-full gap-5 p-6 flex-wrap">
          <div className="flex items-center justify-center bg-violet-600  w-full max-w-sm p-6 rounded-lg shadow-lg text-center mb-6">
    <div className="w-full">
    <h2 className="text-2xl  font-bold text-white mb-4">Mood Analysis</h2>
    <div className="w-full max-w-[500px] h-auto overflow-hidden">
    <Bar 
      data={{ 
        labels: weekLabels, 
        datasets: [{ 
          label: "Mood Score",
          labels: moodLabels,
          data: moodData,
          backgroundColor: ["#808080", "#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#8E44AD", "#F39C12"],
          borderColor: "#ffffff", 
          borderWidth: 1 
        }] 
      }}
      options={{ 
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            labels: { color: "white" } 
          } 
        }, 
        scales: { 
          x: { 
            ticks: { color: "white" } 
          }, 
          y: { 
            ticks: { 
              color: "white", 
              stepSize: 1, 
              min: 0, 
              max: moodLabels.length - 1, 
              callback: (value) => moodLabels[value] || "",
              autoSkip: false 
            }, 
            title: { 
              display: true, 
              text: "Mood Score", 
              color: "white" 
            } 
          } 
        } 
      }} 
    />
  </div>
</div>
</div>


          <div className="flex items-center justify-center bg-violet-600  w-full max-w-sm p-6 rounded-lg  shadow-lg text-center mb-6">
            <div className="w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Activity Tracking</h2>
              <div className="w-full max-w-[1000px] h-auto overflow-hidden">
              <Line data={{ labels: weekLabels, datasets: [{ label: "Activities Completed", data: activityData, fill: false, borderColor: "rgb(75, 192, 192)", tension: 0.1 }] }} 
                    options={{ plugins: { legend: { labels: { color: "white" } } }, scales: { x: { ticks: { color: "white" } }, y: { ticks: { color: "white", beginAtZero: true } } } }} />
            </div>
            </div>
          </div>
        </div>

        {/* Sessions Section */}
        <div className="bg-transparent bg-[repeating-linear-gradient(45deg,_rgba(255,255,255,0.05)_0px,_rgba(255,255,255,0.05)_10px,_transparent_10px,_transparent_20px)]  p-6 rounded-lg shadow-md mb-6">
        <h3 className="relative text-3xl sm:text-4xl font-bold uppercase tracking-wide text-white mb-6 p-3 
    bg-[repeating-linear-gradient(45deg,_rgba(255,255,255,0.1)_0px,_rgba(255,255,255,0.1)_10px,_transparent_10px,_transparent_20px)] 
    rounded-lg shadow-lg sm:px-6 sm:py-3 text-center">
  
  <span className="absolute inset-0 -z-10 blur-md opacity-40 text-gray-700">
    Sessions
  </span>
  
  Sessions
</h3>

{sessions.length > 0 ? (
    <ul className="space-y-6">
      {sessions.map((session) => (
        <li key={session._id} className="bg-purple-950 p-4 rounded-lg shadow-lg border border-white
             hover:shadow-xl transition-shadow">
          <p className="text-lg text-gray-300">
            <span className="text-white font-semibold uppercase tracking-wider">Counselor:</span> {session.counselorName}
          </p>
          <p className="text-lg text-gray-300">
            <span className="text-white font-semibold uppercase tracking-wider">Specialization:</span> {session.counselorSpecification}
          </p>
          <p className="text-lg text-gray-300">
            <span className="text-white font-semibold uppercase tracking-wider">Issue Details:</span> {session.issueDetails}
          </p>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-400 text-center text-lg">No sessions found.</p>
  )}
        </div>

        {/* Journals Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-2xl font-semibold mb-4">Journals</h3>
          {journals.length > 0 ? (
            <ul className="space-y-4">
              {journals.map((journal) => (
                <li key={journal._id} className="border-b border-gray-600 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-medium text-blue-400">{journal.topic || "Untitled Entry"}</h4>
                    <span className="text-sm text-gray-400">{new Date(journal.entryDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{journal.entryText}</p>
                  {journal.moodScore && (
                    <div className="mt-2 text-sm text-gray-400">Mood Score: {journal.moodScore}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No journal entries found.</p>
          )}
        </div>

        {/* Issues Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-2xl font-semibold mb-4">Issues</h3>
          <ul className="space-y-2">
            {issues.map((issue) => (
              <li key={issue._id} className="border-b border-gray-600 pb-2 last:pb-0">
                <p><span className="font-semibold">Issue Name:</span> {issue.illnessType}</p>
                <p><span className="font-semibold">Severity:</span> {issue.severity}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Report Section */}
        {report ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-2xl font-semibold mb-4">Student Report</h3>
            <p className="text-lg font-medium">Parent Name: {report.parentName || "N/A"}</p>
            <p className="text-lg font-medium">Student Name: {report.studentName || "N/A"}</p>
            <p><span className="font-semibold">Avg Mood:</span> {report.avgMood || "N/A"}</p>
            <p><span className="font-semibold">Journals:</span> {report.totalJournals || "N/A"}</p>
          </div>
        ) : (
          <p className="text-gray-500">No report available</p>
        )}
      </div>
    </div>
  );
}

export default ParentDashboard;