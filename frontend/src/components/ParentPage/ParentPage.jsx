"use client";
import React, { useState, useEffect } from "react";
// Navigation will be handled by parent component
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
import { Calendar, MessageSquare, AlertTriangle, Video, Users, LogOut, BarChart3, BookOpen, Bell } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  const moodLabels = ["Not Logged In", "Angry", "Sad", "Anxious", "Tired", "Excited", "Happy"];
  const weekLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const [moodData, setMoodData] = useState(Array(7).fill(0));
  const [activityData, setActivityData] = useState(Array(7).fill(0));
  const [sessions, setSessions] = useState([]);
  const [journals, setJournals] = useState([]);
  const [issues, setIssues] = useState([]);
  const [report, setReport] = useState(null);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [requestForm, setRequestForm] = useState({ preferredDate: '', preferredTime: '', reason: '' });
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
      console.error("Access token is missing");
      return;
    }

    const fetchData = async () => {
      try {
        const urls = [
          { key: "mood", url: "/parent/week-mood-chart" },
          { key: "sessions", url: `/parent/parent/sessions` },
          { key: "journals", url: `/parent/parent/journals` },
          { key: "issues", url: `/parent/parent/issues` },
          { key: "report", url: `/parent/parent/report` },
        ];

        const requests = urls.map(({ url }) =>
          fetch(`https://api.mindfull.com${url}`, {
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
        setJournals(journalsRes && journalsRes.journals ? journalsRes.journals : []);
        setIssues(issuesRes.issues || []);
        setReport(reportRes.data || null);

        // Fetch critical alerts and upcoming sessions
        const [alertsRes, upcomingRes] = await Promise.all([
          fetch(`https://api.mindfull.com/parent/parent/critical-alerts`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch(`https://api.mindfull.com/parent/parent/upcoming-sessions`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
        ]);
        setCriticalAlerts(alertsRes.alerts || []);
        setUpcomingSessions(upcomingRes.sessions || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [parentId]);

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    // Navigate to login page - this should be handled by parent component
    window.location.href = "/";
  };

  const handleRequestCounselor = () => {
    setShowRequestModal(true);
  };

  const handleRequestFormChange = (e) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestSubmit = async () => {
    setRequestLoading(true);
    const token = sessionStorage.getItem("accessToken");
    try {
      const res = await fetch("https://api.mindfull.com/parent/parent/request-counselor", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestForm),
      });
      const data = await res.json();
      setShowRequestModal(false);
      setRequestForm({ preferredDate: '', preferredTime: '', reason: '' });
      if (data.success) {
        alert("Counselor meeting request submitted successfully!");
      } else {
        alert(data.message || "Failed to submit request");
      }
    } catch (err) {
      alert("Failed to submit request");
    } finally {
      setRequestLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Sessions</p>
              <p className="text-3xl font-bold">{sessions.length}</p>
            </div>
            <Video className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Journal Entries</p>
              <p className="text-3xl font-bold">{journals.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Issues</p>
              <p className="text-3xl font-bold">{issues.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Avg Mood</p>
              <p className="text-3xl font-bold">{report?.avgMood || "N/A"}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-teal-200" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
            Weekly Mood Analysis
          </h3>
          <div className="h-64">
            <Bar 
              data={{ 
                labels: weekLabels, 
                datasets: [{ 
                  label: "Mood Score",
                  data: moodData,
                  backgroundColor: "rgba(59, 130, 246, 0.8)",
                  borderColor: "rgba(59, 130, 246, 1)", 
                  borderWidth: 2,
                  borderRadius: 6
                }] 
              }}
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    display: false
                  } 
                }, 
                scales: { 
                  x: { 
                    grid: { display: false },
                    ticks: { color: "#6B7280", font: { size: 12 } }
                  }, 
                  y: { 
                    grid: { color: "#F3F4F6" },
                    ticks: { 
                      color: "#6B7280", 
                      stepSize: 1, 
                      min: 0, 
                      max: moodLabels.length - 1, 
                      callback: (value) => moodLabels[value] || "",
                      autoSkip: false 
                    }
                  } 
                } 
              }} 
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-500" />
            Activity Tracking
          </h3>
          <div className="h-64">
            <Line 
              data={{ 
                labels: weekLabels, 
                datasets: [{ 
                  label: "Activities Completed", 
                  data: activityData, 
                  fill: true,
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  borderColor: "rgba(34, 197, 94, 1)", 
                  tension: 0.4,
                  pointBackgroundColor: "rgba(34, 197, 94, 1)",
                  pointBorderColor: "#fff",
                  pointBorderWidth: 2,
                  pointRadius: 5
                }] 
              }} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false } 
                }, 
                scales: { 
                  x: { 
                    grid: { display: false },
                    ticks: { color: "#6B7280", font: { size: 12 } } 
                  }, 
                  y: { 
                    grid: { color: "#F3F4F6" },
                    ticks: { color: "#6B7280", beginAtZero: true } 
                  } 
                } 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Sessions and Journals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Video className="h-5 w-5 mr-2 text-purple-500" />
            Recent Sessions
          </h3>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.slice(0, 3).map((session) => (
                <div key={session._id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                  <p className="font-semibold text-gray-800">{session.counselorName}</p>
                  <p className="text-sm text-gray-600">{session.counselorSpecification}</p>
                  <p className="text-sm text-gray-500 mt-1">{session.issueDetails}</p>
                </div>
              ))}
              {sessions.length > 3 && (
                <p className="text-sm text-gray-500 text-center">+{sessions.length - 3} more sessions</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sessions found.</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
            Recent Journal Entries
          </h3>
          {journals.length > 0 ? (
            <div className="space-y-4">
              {journals.slice(0, 3).map((journal) => (
                <div key={journal._id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{journal.topic || "Untitled Entry"}</h4>
                    <span className="text-xs text-gray-500">{new Date(journal.entryDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{journal.entryText}</p>
                </div>
              ))}
              {journals.length > 3 && (
                <p className="text-sm text-gray-500 text-center">+{journals.length - 3} more entries</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No journal entries found.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderCriticalInfo = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-red-500" />
          Critical Alerts
        </h3>
        <div className="space-y-4">
          {criticalAlerts.length > 0 ? criticalAlerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
              alert.type === 'urgent' ? 'bg-red-50 border-red-500' :
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex justify-between items-start">
                <p className={`font-medium ${
                  alert.type === 'urgent' ? 'text-red-800' :
                  alert.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>{alert.message}</p>
                <span className="text-xs text-gray-500">{typeof alert.timestamp === 'string' ? alert.timestamp : new Date(alert.timestamp).toLocaleString()}</span>
              </div>
            </div>
          )) : <p className="text-gray-500 text-center py-8">No critical alerts.</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          Current Issues
        </h3>
        {issues.length > 0 ? (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{issue.illnessType}</p>
                    <p className="text-sm text-gray-600">Severity: {issue.severity}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    issue.severity === 'High' ? 'bg-red-100 text-red-800' :
                    issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No active issues.</p>
        )}
      </div>
    </div>
  );

  const renderCounseling = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Video className="h-5 w-5 mr-2 text-blue-500" />
            Counseling Sessions
          </h3>
          <button
            onClick={handleRequestCounselor}
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 flex items-center"
          >
            <Users className="h-4 w-4 mr-2" />
            Request Counselor
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Completed Sessions</h4>
            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-gray-800">{session.counselorName}</h5>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{session.counselorSpecification}</p>
                    <p className="text-sm text-gray-500">{session.issueDetails}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No completed sessions.</p>
            )}
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Sessions</h4>
            <div className="space-y-4">
              {upcomingSessions.length > 0 ? upcomingSessions.map((session) => (
                <div key={session.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-gray-800">{session.counselor}</h5>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Scheduled</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{session.type}</p>
                  <p className="text-sm text-gray-500">{session.date} {session.time && `at ${session.time}`}</p>
                </div>
              )) : <p className="text-gray-500 text-center py-8">No upcoming sessions.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
              <a className="flex title-font font-medium items-center text-gray-900 group transition-all duration-300 hover:scale-105 flex-shrink-0" >
              <div className="relative">
                <img src="plant.png" alt="Logo" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
              <span className="ml-3 text-xl bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text text-transparent font-bold tracking-wide">
                MindFull
              </span>
            </a>
            
            <div className="flex items-center space-x-8">
              <div className="hidden md:flex space-x-8">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "dashboard" 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("critical")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "critical" 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Critical Info
                </button>
                <button
                  onClick={() => setActiveTab("counseling")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "counseling" 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Counseling
                </button>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your child's mental health journey</p>
        </div>

        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "critical" && renderCriticalInfo()}
        {activeTab === "counseling" && renderCounseling()}
      </main>

      {/* Request Counselor Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Request Counselor Meeting</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input type="date" name="preferredDate" value={requestForm.preferredDate} onChange={handleRequestFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <select name="preferredTime" value={requestForm.preferredTime} onChange={handleRequestFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select a time</option>
                  <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 5:00 PM)">Afternoon (12:00 PM - 5:00 PM)</option>
                  <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Meeting</label>
                <textarea name="reason" value={requestForm.reason} onChange={handleRequestFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Brief description of concerns..."></textarea>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestSubmit}
                className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all"
                disabled={requestLoading}
              >
                {requestLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParentDashboard;