import React from "react";
import Navbar from "../Navbar/Navbar";
import { useState,useEffect } from "react";
import { useTranslation } from 'react-i18next';

export default function Activity(){
    const { t } = useTranslation();
    const activities1= [
        {
          "name": "Shooting Stars",
          "description": "VHS cornhole pop-up, try-hard 8-bit iceland helvetica.",
          "id":"1"
        },
        {
          "name": "The Catalyzer",
          "description": "VHS cornhole pop-up, try-hard 8-bit iceland helvetica.",
          "id":"1"
        },
        {
          "name": "The 400 Blows",
          "description": "VHS cornhole pop-up, try-hard 8-bit iceland helvetica.",
          "id":"1"
        },
        {
          "name": "Neptune",
          "description": "VHS cornhole pop-up, try-hard 8-bit iceland helvetica.",
          "id":"1"
        }
      ]
    // const [activity, setActivities] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
  
    // useEffect(() => {
    //   const fetchActivities = async () => {
    //     try {
         
    //       const response = await fetch('http://localhost:5000/api/activities');
  
    //       if (!response.ok) {
    //         throw new Error('Failed to fetch activities');
    //       }
    //       const data = await response.json();
    //       setActivities(data.activities); 
    //     } catch (err) {
    //       setError(err.message);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };
  
    //   fetchActivities();
    // }, []); 
  
    // if (loading) {
    //   return <p>Loading activities...</p>;
    // }
  
    // if (error) {
    //   return <p>Error: {error}</p>;
    // }
    // const handleClick = async (activityId) => {
    //     try {
    //       const response = await fetch(`http://localhost:5000/api/activities/${activityId}/done`, {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ status: 'done' }),
    //       });
    
    //       if (!response.ok) {
    //         throw new Error('Failed to mark activity as done');
    //       }
    
    //       const data = await response.json();
    //       alert(`Activity ${activityId} marked as done!`);
          
    //       // Optionally, update the activity list or state to reflect changes after successful submission.
    //       // For example, you could update the activity status in the frontend or show a confirmation.
    //     } catch (err) {
    //       alert(`Error: ${err.message}`);
    //     }
    //   };
    
    //   if (loading) {
    //     return <p>Loading activities...</p>;
    //   }
      //   if (error) {
    //     return <p>Error: {error}</p>;
    //   }

    return(
        <>
        <Navbar />
        <section className="text-yellow-400 body-font bg-gray-900">
      <div className="container px-5 py-24 mx-auto flex flex-wrap">
        <div className="text-center w-full mb-10">
          <h1 className="text-3xl font-bold text-white mb-4">{t('activities.title')}</h1>
          <p className="text-gray-300">{t('activities.description')}</p>
        </div>
        {activities1.map((activity, index) => (
          <div key={index} className="flex relative pb-20 sm:items-center md:w-2/3 mx-auto">
            <div className="h-full w-6 absolute inset-0 flex items-center justify-center">
              <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
            </div>
            <div className="flex-shrink-0 w-6 h-6 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-indigo-500 text-white relative z-10 title-font font-medium text-sm">
              {index + 1}
            </div>
            <div className="flex-grow md:pl-8 pl-6 flex sm:items-center items-start flex-col sm:flex-row">
              <div className="flex-shrink-0 w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full inline-flex items-center justify-center">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="w-12 h-12"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div className="flex-grow sm:pl-6 mt-6 sm:mt-0">
                <h2 className="font-medium title-font text-yellow-700 mb-1 text-xl">
                  {activity.name}
                </h2>
                <p className="leading-relaxed">{activity.description}</p>                <button
                  className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-lg"
                  // onClick={() => handleClick(activity.id)} 
                >
                  {t('common.done')}
                </button>
              </div>
            </div>
          </div>        ))}
      </div>
    </section>
        </>
    )

}