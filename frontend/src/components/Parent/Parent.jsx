import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeeklyMoodChart = () => {
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzhmM2IyN2ViMjM0ZTkxY2Q0Yjc3NTAiLCJlbWFpbCI6ImhhcmlzYW5rZXlAZ21haWwuY29tMjMiLCJ1c2VybmFtZSI6ImlvcHF3ZXJ0ODkwIiwiaWF0IjoxNzM3NDQwMzA5LCJleHAiOjE3Mzc1MjY3MDl9.M8pwgutjfiWBsYhIzI10oaFkoJIlaS3ct3LkTPeZxVg"

  useEffect(() => {
    const fetchMoodData = async () => {
      if (!token) {
        setError("No authentication token provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching data with token:", token.substring(0, 10) + "..."); // Log truncated token
        
        const response = await fetch("/api/users/week-mood-chart", {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        });

        console.log("Response status:", response.status); // Log response status

        // Get response text first
        const responseText = await response.text();
        console.log("Raw response:", responseText); // Log raw response

        let data;
        try {
          // Try to parse the text as JSON
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }

        if (data && data.success && Array.isArray(data.data)) {
          const transformedData = data.data.map((value, index) => ({
            day: getDayName(index),
            mood: value ?? 0
          }));
          console.log("Transformed data:", transformedData);
          setMoodData(transformedData);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        console.error("Error details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodData();
  }, [token]);

  const getDayName = (index) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[index];
  };

  // Sample data for testing
  const sampleData = [
    { day: "Monday", mood: 3 },
    { day: "Tuesday", mood: 4 },
    { day: "Wednesday", mood: 3 },
    { day: "Thursday", mood: 5 },
    { day: "Friday", mood: 4 },
    { day: "Saturday", mood: 5 },
    { day: "Sunday", mood: 4 }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 border border-gray-200 rounded-lg bg-white">
        <div className="text-lg">Loading mood data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 border border-gray-200 rounded-lg bg-white p-4">
        <div className="text-red-500 mb-2">Error loading mood data</div>
        <div className="text-sm text-gray-600">{error}</div>
      </div>
    );
  }

  const displayData = moodData.length > 0 ? moodData : sampleData;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Weekly Mood Chart</h2>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              tick={{ fill: '#666' }}
            />
            <YAxis 
              domain={[0, 5]} 
              ticks={[0, 1, 2, 3, 4, 5]}
              tick={{ fill: '#666' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #ccc'
              }} 
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4, fill: '#8884d8' }}
              activeDot={{ r: 6 }}
              name="Mood Level"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Mood levels: 1 (Very Sad) to 5 (Very Happy)
      </div>
    </div>
  );
};

export default WeeklyMoodChart;