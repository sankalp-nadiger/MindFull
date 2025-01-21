import React, { useEffect, useState } from "react";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";
import { Filler } from "chart.js";
ChartJS.register(Filler);

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const WeeklyMoodChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyMoodData = async () => {
      try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzhmM2IyN2ViMjM0ZTkxY2Q0Yjc3NTAiLCJlbWFpbCI6ImhhcmlzYW5rZXlAZ21haWwuY29tMjMiLCJ1c2VybmFtZSI6ImlvcHF3ZXJ0ODkwIiwiaWF0IjoxNzM3NDY1MjE3LCJleHAiOjE3Mzc1NTE2MTd9.4vf-PqaQFoJ_plxdZnRA97Z5HP_WS4T36rebZLyWj4Q"; // Replace with your actual access token
        const response = await fetch("http://localhost:8000/api/users/week-mood-chart", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        console.log("API Response:", result);
        if (result.success) {
          // Prepare data for Chart.js
          const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          setChartData({
            labels: days,
            datasets: [
              {
                label: "Mood Score",
                data: result.data,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
                fill: true,
              },
            ],
          });
        } else {
          console.error(result.message);
        }
      } catch (error) {
        console.error("Error fetching mood data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyMoodData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Weekly Mood Report</h2>
      {chartData ? (
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "Weekly Mood Report",
              },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) =>
                    tooltipItem.raw === null
                      ? "No data"
                      : `Mood Score: ${tooltipItem.raw}`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Mood Score",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Days of the Week",
                },
              },
            },
          }}
        />
      ) : (
        <p>No data available for this week.</p>
      )}
    </div>
  );
};

export default WeeklyMoodChart;
