"use client";
import React from "react";
import { WobbleCard } from "./Card";
import Navbar from "../Navbar/Navbar";
import { useState } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import {Bar, Doughnut, Line} from "react-chartjs-2"
function ParentDashboard(){
    return(
    <>  
    <Navbar/> 
        <div className="flex items-center justify-center w-full gap-9 p-6 ">
        <div className="flex items-center justify-center  bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Responsive Card</h2>
        <Bar
          data={{
            labels:["A","B","C"],
            datasets:[
              {
                label:"revenue",
                data:[200,300,400]
,              }
            ]
          }} />
      
      </div>
    </div>
      
    <div className="flex items-center justify-center  bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Responsive Card</h2>
        <Doughnut
          data={{labels: [
            'Red',
            'Blue',
            'Yellow'
          ],
          datasets: [{
            label: 'My First Dataset',
            data: [300, 50, 100],
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
          }] 
        }}/>
    
      
      </div>
    </div>
    
    <div className="flex items-center justify-center  bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Responsive Card</h2>
        <Line
          data={{labels: [
            'Red',
            'Blue',
            'Yellow'
          ],
          datasets: [{
            label: 'My First Dataset',
            data: [300, 50, 100],
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
          }] 
        }}/>
    
    </div>
      
      </div>
    
    
        
         
      </div>
    
    </>
    );
}

export default ParentDashboard;