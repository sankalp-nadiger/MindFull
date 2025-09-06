import React, { useState } from 'react';
import Layout from '../Layout';
import ScheduleContent from './ScheduleContent';
import CaseHistoryContent from '../Clients/CaseHistory'; 
const Schedule = () => {
  const [currentView, setCurrentView] = useState('schedule');
  const [selectedClientId, setSelectedClientId] = useState(null);

  const handleViewCaseHistory = (clientId) => {
    setSelectedClientId(clientId);
    setCurrentView('case-history');
  };

  const handleBackToSchedule = () => {
    setSelectedClientId(null);
    setCurrentView('schedule');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'schedule':
        return <ScheduleContent onViewCaseHistory={handleViewCaseHistory} />;
      case 'case-history':
        return (
          <CaseHistoryContent 
            clientId={selectedClientId} 
            onBack={handleBackToSchedule} 
          />
        );
      default:
        return <ScheduleContent onViewCaseHistory={handleViewCaseHistory} />;
    }
  };

  return (
    <Layout onViewCaseHistory={handleViewCaseHistory}>
      {renderContent()}
    </Layout>
  );
};

export default Schedule;