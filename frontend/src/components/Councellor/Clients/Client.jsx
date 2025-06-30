import React, { useState } from 'react';
import Layout from '../Layout';
import ClientsContent from './ClientContent';
import CaseHistoryContent from './CaseHistory'; 

const Clients = () => {
  const [currentView, setCurrentView] = useState('clients');
  const [selectedClientId, setSelectedClientId] = useState(null);

  const handleViewCaseHistory = (clientId) => {
    setSelectedClientId(clientId);
    setCurrentView('case-history');
  };

  const handleBackToClients = () => {
    setSelectedClientId(null);
    setCurrentView('clients');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'clients':
        return <ClientsContent onViewCaseHistory={handleViewCaseHistory} />;
      case 'case-history':
        return (
          <CaseHistoryContent 
            clientId={selectedClientId} 
            onBack={handleBackToClients} 
          />
        );
      default:
        return <ClientsContent onViewCaseHistory={handleViewCaseHistory} />;
    }
  };

  return (
    <Layout onViewCaseHistory={handleViewCaseHistory}>
      {renderContent()}
    </Layout>
  );
};

export default Clients;