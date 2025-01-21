import React from "react";
import "./Dashboard.css"; // Optional: Add your styling for the dashboard

const Dashboard = ({ activities }) => {
  return (
    <div className="dashboard">
      <h1>Welcome to Your Wellness Dashboard</h1>
      <h2>Here are your activities:</h2>
      <div className="activities-list">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <h3>{activity}</h3>
            </div>
          ))
        ) : (
          <p>No activities available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
