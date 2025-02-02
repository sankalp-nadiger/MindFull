// import React, { useState, useEffect } from "react";
// import {
//   Chart as ChartJS,
//   LineElement,
//   PointElement,
//   LinearScale,
//   Title,
//   Tooltip,
//   Legend,
//   CategoryScale,
// } from "chart.js";
// import { Line } from "react-chartjs-2";
// import { Filler } from "chart.js";

// ChartJS.register(Filler);
// ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

// const ParentDashboard = () => {
//   const [chartData, setChartData] = useState(null);
//   const [sessions, setSessions] = useState([]);
//   const [journals, setJournals] = useState([]);
//   const [issues, setIssues] = useState([]);
//   const [notification, setNotification] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzhmM2IyN2ViMjM0ZTkxY2Q0Yjc3NTAiLCJlbWFpbCI6ImhhcmlzYW5rZXlAZ21haWwuY29tMjMiLCJ1c2VybmFtZSI6ImlvcHF3ZXJ0ODkwIiwiaWF0IjoxNzM3NDcwMjQ0LCJleHAiOjE3Mzc1NTY2NDR9.xzmKhYHiFClfQH4HTagmKwb7BZPYClkn-0Qx4VbjKuI"

//   // Fetch functions
//   const fetchWeeklyMoodData = async () => {
//     try {
//       const response = await fetch("http://localhost:8000/api/users/week-mood-chart", {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const result = await response.json();
//       if (result.success) {
//         const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
//         setChartData({
//           labels: days,
//           datasets: [
//             {
//               label: "Mood Score",
//               data: result.data,
//               backgroundColor: "rgba(75, 192, 192, 0.2)",
//               borderColor: "rgba(75, 192, 192, 1)",
//               borderWidth: 1,
//               fill: true,
//             },
//           ],
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching mood data:", error);
//     }
//   };

//   const fetchSessions = async () => {
//     try {
//       const response = await fetch(`http://localhost:8000/parent/sessions`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const result = await response.json();
//       if (result.success) {
//         setSessions(result.sessions);
//       }
//     } catch (error) {
//       console.error("Error fetching sessions:", error);
//     }
//   };

//   const fetchJournals = async () => {
//     try {
//       const response = await fetch(`http://localhost:8000/parent/journals`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const result = await response.json();
//       if (result.success) {
//         setJournals(result.journals);
//       }
//     } catch (error) {
//       console.error("Error fetching journals:", error);
//     }
//   };

//   const fetchIssues = async () => {
//     try {
//       const response = await fetch(`http://localhost:8000/parent/issues`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const result = await response.json();
//       if (result.success) {
//         setIssues(result.issues);
//       }
//     } catch (error) {
//       console.error("Error fetching issues:", error);
//     }
//   };

//   const checkMoodAndNotifyParent = async () => {
//     try {
//       const response = await fetch("http://localhost:8000/api/mood-check", {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const result = await response.json();
//       if (result.success && result.message) {
//         setNotification(result.message);
//       }
//     } catch (error) {
//       console.error("Error checking mood history:", error);
//     }
//   };

//   // Fetch data when component mounts
//   const fetchData = async () => {
//     setLoading(true);
//     await Promise.all([
//       fetchWeeklyMoodData(),
//       fetchSessions(),
//       fetchJournals(),
//       fetchIssues(),
//       checkMoodAndNotifyParent(),
//     ]);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchData();
//   }, [token]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h1>Parent Dashboard</h1>

//       {/* Weekly Mood Chart */}
//       <section>
//         <h2>Weekly Mood Report</h2>
//         {chartData ? (
//           <Line
//             data={chartData}
//             options={{
//               responsive: true,
//               plugins: {
//                 title: {
//                   display: true,
//                   text: "Weekly Mood Report",
//                 },
//                 tooltip: {
//                   callbacks: {
//                     label: (tooltipItem) =>
//                       tooltipItem.raw === null ? "No data" : `Mood Score: ${tooltipItem.raw}`,
//                   },
//                 },
//               },
//               scales: {
//                 y: {
//                   beginAtZero: true,
//                   title: {
//                     display: true,
//                     text: "Mood Score",
//                   },
//                 },
//                 x: {
//                   title: {
//                     display: true,
//                     text: "Days of the Week",
//                   },
//                 },
//               },
//             }}
//           />
//         ) : (
//           <p>No data available for this week.</p>
//         )}
//       </section>

//       {/* Notification */}
//       {notification && (
//         <section>
//           <h2>Notification</h2>
//           <p>{notification}</p>
//         </section>
//       )}

//       {/* Sessions */}
//       <section>
//         <h2>Sessions</h2>
//         {sessions.length > 0 ? (
//           <ul>
//             {sessions.map((session) => (
//               <li key={session._id}>
//                 {session.counselor.name} - {session.counselor.expertise}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p>No sessions available.</p>
//         )}
//       </section>

//       {/* Journals */}
//       <section>
//         <h2>Journals</h2>
//         {journals.length > 0 ? (
//           <ul>
//             {journals.map((journal) => (
//               <li key={journal._id}>{journal.title}</li>
//             ))}
//           </ul>
//         ) : (
//           <p>No journals available.</p>
//         )}
//       </section>

//       {/* Issues */}
//       <section>
//         <h2>Issues</h2>
//         {issues.length > 0 ? (
//           <ul>
//             {issues.map((issue) => (
//               <li key={issue._id}>{issue.description}</li>
//             ))}
//           </ul>
//         ) : (
//           <p>No issues reported.</p>
//         )}
//       </section>
//     </div>
//   );
// };

// export default ParentDashboard;
