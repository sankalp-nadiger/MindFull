"use client";
import React from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import ParentStudentDetails from "../pages/ParentDashBoard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function ParentDashboard() {
  // Chart Data Definitions
  const barChartData = {
    labels: ["A", "B", "C"],
    datasets: [
      {
        label: "Mood Score",
        data: [200, 300, 400],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        borderColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Week 1", "Week 2", "Week 3","Week 4"],
    datasets: [
      {
        label: "Daily Streak",
        data: [4, 7, 7,6],
        backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255, 205, 86)","rgb(255,262,99"],
        hoverOffset: 4,
      },
    ],
  };

  const lineChartData = {
    labels: ["Week 1", "Week 2", "Week 3","Week 4"],
    datasets: [
      {
        label: "Number of Activities Completed",
        data: [5, 9, 0, 7],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <>
      {/* Responsive Cards with Charts */}
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Parent Dashboard</h2>
      <div className="flex items-center justify-center w-full gap-9 p-6 flex-wrap">
      
        {/* Card 1: Bar Chart */}
        <div className="flex items-center justify-center bg-gray-800 w-full max-w-sm p-6 rounded-lg shadow-lg text-center mb-6 md:mb-0">
          <div className="w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Mood Analysis</h2>
            <Bar data={barChartData} options={{ plugins: { legend: { labels: { color: "white" } } }, scales: { x: { ticks: { color: "white" } }, y: { ticks: { color: "white" } } } }} />
          </div>
        </div>

        {/* Card 2: Doughnut Chart */}
        <div className="flex items-center justify-center bg-gray-800 w-full max-w-sm p-6 rounded-lg shadow-lg text-center mb-6 md:mb-0">
          <div className="w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Daily Streak</h2>
            <Doughnut data={doughnutChartData} options={{ plugins: { legend: { labels: { color: "white" } } } }} />
          </div>
        </div>

        {/* Card 3: Line Chart */}
        <div className="flex items-center justify-center bg-gray-800 w-full max-w-sm p-6 rounded-lg shadow-lg text-center mb-6 md:mb-0">
          <div className="w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Activity Tracking</h2>
            <Line data={lineChartData} options={{ plugins: { legend: { labels: { color: "white" } } }, scales: { x: { ticks: { color: "white" } }, y: { ticks: { color: "white" } } } }} />
          </div>
        </div>

      </div>
    </div>
      {/* <ParentStudentDetails/> */}
    </>
  );
}

export default ParentDashboard;
