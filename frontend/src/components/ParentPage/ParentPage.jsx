"use client";
import React from "react";
import { WobbleCard } from "./Card";
import Navbar from "../Navbar/Navbar";
import { useState } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import {Bar, Doughnut, Line} from "react-chartjs-2"
import ParentDashboardCard from "./ParentCard";
function ParentDashboard(){
    return(
    <>  
    <Navbar/> 
    <ParentDashboard/>
    <div className="flex items-center justify-center w-full gap-9 p-6 flex-wrap">
  <div className="flex items-center justify-center bg-gray-100 w-full max-w-sm p-6  rounded-lg shadow-lg text-center mb-6 md:mb-0">
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Responsive Card</h2>
      <Bar
        data={{
          labels: ["A", "B", "C"],
          datasets: [
            {
              label: "Revenue",
              data: [200, 300, 400],
            },
          ],
        }}
      />
    </div>
  </div>

  <div className="flex items-center justify-center bg-gray-100 w-full max-w-sm p-6 rounded-lg shadow-lg text-center mb-6 md:mb-0">
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Responsive Card</h2>
      <Doughnut
        data={{
          labels: ['Red', 'Blue', 'Yellow'],
          datasets: [{
            label: 'My First Dataset',
            data: [300, 50, 100],
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
            ],
            hoverOffset: 4,
          }],
        }}
      />
    </div>
  </div>

  {/* Card 3: Line Chart */}
  <div className="flex items-center justify-center bg-gray-100 w-full max-w-sm p-6 rounded-lg shadow-lg text-center mb-6 md:mb-0">
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Responsive Card</h2>
      <Line
        data={{
          labels: ['Red', 'Blue', 'Yellow'],
          datasets: [{
            label: 'My First Dataset',
            data: [300, 50, 100],
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
            ],
            hoverOffset: 4,
          }],
        }}
      />
    </div>
  </div>
</div>

    
    </>
    );
}

export default ParentDashboard;