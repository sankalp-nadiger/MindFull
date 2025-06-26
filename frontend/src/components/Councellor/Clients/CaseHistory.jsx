import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  Loader, 
  User, 
  Heart, 
  Brain, 
  Activity,
  Target,
  MessageSquare,
  BarChart3
} from 'lucide-react';

const CaseHistoryContent = ({ clientId, onBack }) => {
  const [caseHistory, setCaseHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    if (clientId) {
      fetchCaseHistory();
    }
  }, [clientId]);

  const fetchCaseHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/user/case_history?clientId=${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch case history');
      }
      const data = await response.json();
      setCaseHistory(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching case history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood) => {
    const moodLower = mood?.toLowerCase() || '';
    if (moodLower.includes('excellent') || moodLower.includes('great')) return 'bg-green-100 text-green-800';
    if (moodLower.includes('good') || moodLower.includes('positive')) return 'bg-blue-100 text-blue-800';
    if (moodLower.includes('neutral') || moodLower.includes('okay')) return 'bg-gray-100 text-gray-800';
    if (moodLower.includes('anxious') || moodLower.includes('stressed')) return 'bg-yellow-100 text-yellow-800';
    if (moodLower.includes('depressed') || moodLower.includes('low')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading case history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">Error loading case history: {error}</span>
          </div>
          <button 
            onClick={fetchCaseHistory}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!caseHistory) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Case History Found</h3>
        <p className="text-gray-500">Unable to load case history for this client.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </button>
      </div>

      {/* Client Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {caseHistory.clientName || caseHistory.name || 'Client Profile'}
              </h1>
              <p className="text-gray-600 mt-1">Case History & Progress Overview</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Sessions</p>
            <p className="text-3xl font-bold text-blue-600">{caseHistory.totalSessions || 0}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Mood</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getMoodColor(caseHistory.currentMood)}`}>
                {caseHistory.currentMood || 'Not recorded'}
              </span>
            </div>
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Issues</p>
              <p className="text-2xl font-bold text-gray-900">{caseHistory.activeIssues?.length || 0}</p>
            </div>
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Progress Score</p>
              <p className="text-2xl font-bold text-gray-900">{caseHistory.progressScore || 0}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Platform Activity</p>
              <p className="text-2xl font-bold text-gray-900">{caseHistory.activityScore || 0}/10</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Issues Designated by Counselors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-600" />
          Issues Designated by Counselors
        </h2>
        {caseHistory.counselorIssues && caseHistory.counselorIssues.length > 0 ? (
          <div className="space-y-4">
            {caseHistory.counselorIssues.map((issue, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{issue.title || issue.issue}</h3>
                    <p className="text-sm text-gray-600 mt-1">{issue.description || issue.notes}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Severity: {issue.severity || 'Medium'}</span>
                      <span>•</span>
                      <span>Identified: {issue.dateIdentified ? new Date(issue.dateIdentified).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    issue.status === 'improving' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {issue.status || 'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No specific issues designated yet.</p>
        )}
      </div>

      {/* Session History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
          Recent Sessions
        </h2>
        {caseHistory.recentSessions && caseHistory.recentSessions.length > 0 ? (
          <div className="space-y-4">
            {caseHistory.recentSessions.map((session, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="font-medium text-gray-900">Session {session.sessionNumber || index + 1}</span>
                      <span className="text-sm text-gray-500">
                        {session.date ? new Date(session.date).toLocaleDateString() : 'Date not recorded'}
                      </span>
                      <span className="text-sm text-gray-500">{session.duration || '50 min'}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{session.notes || session.summary || 'No notes available'}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(session.mood)}`}>
                        Mood: {session.mood || 'Not recorded'}
                      </span>
                      {session.progress && (
                        <span className="text-xs text-gray-500">Progress: {session.progress}%</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Session Type</span>
                    <p className="text-sm font-medium text-gray-900">{session.type || 'Individual'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No session history available.</p>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-orange-600" />
          Platform Activity
        </h2>
        {caseHistory.activityTimeline && caseHistory.activityTimeline.length > 0 ? (
          <div className="space-y-4">
            {caseHistory.activityTimeline.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">{activity.action || activity.activity}</h3>
                    <span className="text-xs text-gray-500">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description || activity.details}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No platform activity recorded yet.</p>
        )}
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
          Progress Overview
        </h2>
        <div className="space-y-4">
          {caseHistory.progressMetrics && caseHistory.progressMetrics.length > 0 ? (
            caseHistory.progressMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{metric.name || metric.metric}</span>
                  <span className="text-sm text-gray-600">{metric.value || metric.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metric.value || metric.score)}`}
                    style={{ width: `${metric.value || metric.score || 0}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm text-gray-600">{caseHistory.progressScore || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(caseHistory.progressScore || 0)}`}
                  style={{ width: `${caseHistory.progressScore || 0}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      {caseHistory.counselorNotes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            Counselor Notes
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{caseHistory.counselorNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseHistoryContent;