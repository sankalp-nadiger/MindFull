"use client";
import React, { useState, useEffect } from "react";
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

        if (moodRes.data) {
          setMoodData(moodRes.data.map((val) => (val !== null ? val + 1 : 0)));
          setActivityData(moodRes.activitiesCompleted || Array(7).fill(0));
        }
        setSessions(sessionsRes.sessions || []);
        setJournals(journalsRes.journals || []);
        setIssues(issuesRes.issues || []);
        setReport(reportRes || null);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [parentId]);

  const barChartData = {
    labels: weekLabels,
    datasets: [
      {
        label: "Mood Score",
        data: moodData,
        backgroundColor: ["#808080", "#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#8E44AD", "#F39C12"],
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: weekLabels,
    datasets: [
      {
        label: "Activities Completed",
        data: activityData,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const barChartOptions = {
    plugins: { legend: { labels: { color: "white" } } },
    scales: {
      x: { ticks: { color: "white" } },
      y: {
        ticks: {
          color: "white",
          stepSize: 1,
          min: 0,
          max: 6,
          callback: (value) => moodLabels[value] || "",
        },
        title: { display: true, text: "Mood Score", color: "white" },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-800 to-black text-white p-6 font-sans">
      <h2 className="text-3xl font-bold text-center mb-6">Parent Dashboard</h2>

      <div className="flex items-center justify-center w-full gap-9 p-6 flex-wrap">
        <div className="flex items-center justify-center bg-gray-800 w-full max-w-sm p-6 rounded-lg shadow-lg text-center">
          <div className="w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Mood Analysis</h2>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        <div className="flex items-center justify-center bg-gray-800 w-full max-w-sm p-6 rounded-lg shadow-lg text-center">
          <div className="w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Activity Tracking</h2>
            <Line
              data={lineChartData}
              options={{
                plugins: { legend: { labels: { color: "white" } } },
                scales: {
                  x: { ticks: { color: "white" } },
                  y: { ticks: { color: "white", beginAtZero: true } },
                },
              }}
            />
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
            <ul className="space-y-2">
              {journals.map((journal) => (
                <li key={journal._id} className="border-b border-gray-600 pb-2">
                  {journal.content}
                </li>
              ))}
            </ul>
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

          {report && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Student Report</h3>
              <p className="text-lg font-medium">Parent Name: {report.parentName}</p>
              <ul className="mt-4 space-y-2">
                {report.reports.map((r) => (
                  <li key={r.studentName} className="border-b border-gray-600 pb-2">
                    {r.studentName}: <span className="font-semibold">Avg Mood:</span> {r.avgMood},{" "}
                    <span className="font-semibold">Journals:</span> {r.totalJournals}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard;
