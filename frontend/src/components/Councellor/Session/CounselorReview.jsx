import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Stethoscope, Calendar, CheckCircle, XCircle } from 'lucide-react';

const CounsellorReview = ({ isOpen, onClose, sessionData, userId, inSittingSeries, sittingNotes }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    symptoms: [],
    needsSittings: false,
    recommendedSittings: 0,
    willingToTreat: false,
    notes: '',
    sittingNotes: '',
    curedSittingReason: false
  });
  // If in sitting series, hide needsSittings/recommendedSittings/willingToTreat, and show sittingNotes
  React.useEffect(() => {
    if (inSittingSeries) {
      setFormData(prev => ({
        ...prev,
        needsSittings: true,
        sittingNotes: sittingNotes || '',
      }));
    }
  }, [inSittingSeries, sittingNotes]);
  const [loading, setLoading] = useState(false);
  const [customSymptom, setCustomSymptom] = useState('');

  const commonSymptoms = [
    'Anxiety', 'Depression', 'Stress', 'Panic Attacks', 'Sleep Issues',
    'Mood Swings', 'Social Withdrawal', 'Concentration Problems',
    'Irritability', 'Low Self-esteem', 'Obsessive Thoughts', 'Trauma Response'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !formData.symptoms.includes(customSymptom.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, customSymptom.trim()]
      }));
      setCustomSymptom('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.diagnosis.trim()) {
      alert('Please provide a diagnosis');
      return;
    }

    setLoading(true);
    try {
      // You'll need to replace this with your actual API call using axios
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/counsellor/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            sessionId: sessionData.sessionId,
            userId: userId,
            ...formData
          })
        }
      );
      
      if (response.ok) {
        onClose();
        alert('Review submitted successfully!');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Post-Session Review</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-2 opacity-90">Complete your assessment for this patient</p>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Patient Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-800">Patient Information</span>
              </div>
              <p className="text-sm text-gray-600">
                Name: {sessionData?.fullName || 'N/A'}<br />
                Session Duration: {sessionData?.duration || 'N/A'} | 
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mental Health Diagnosis *
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                placeholder="Provide your professional diagnosis and assessment..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Observed Symptoms
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => handleSymptomToggle(symptom)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      formData.symptoms.includes(symptom)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
              
              {/* Custom Symptom Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="Add custom symptom..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSymptom())}
                />
                <button
                  type="button"
                  onClick={addCustomSymptom}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Selected Symptoms */}
              {formData.symptoms.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                    >
                      <span>{symptom}</span>
                      <button
                        type="button"
                        onClick={() => handleSymptomToggle(symptom)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>


            {/* Sitting Series Section */}
            {inSittingSeries ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sitting Notes
                  </label>
                  <textarea
                    value={formData.sittingNotes}
                    onChange={(e) => handleInputChange('sittingNotes', e.target.value)}
                    placeholder="Notes for this sitting series..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <input
                    type="checkbox"
                    id="curedSittingReason"
                    checked={formData.curedSittingReason}
                    onChange={(e) => handleInputChange('curedSittingReason', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="curedSittingReason" className="text-sm text-gray-700">
                    User is cured of the reason for recommended sittings
                  </label>
                </div>
              </div>
            ) : formData.needsSittings ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommended number of sessions
                  </label>
                  <select
                    value={formData.recommendedSittings}
                    onChange={(e) => handleInputChange('recommendedSittings', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Select sessions</option>
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(num => (
                      <option key={num} value={num}>{num} sessions</option>
                    ))}
                  </select>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-amber-800">Treatment Commitment</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="willingYes"
                        name="willingToTreat"
                        checked={formData.willingToTreat === true}
                        onChange={() => handleInputChange('willingToTreat', true)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="willingYes" className="flex items-center space-x-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Yes, I will continue treating this patient</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="willingNo"
                        name="willingToTreat"
                        checked={formData.willingToTreat === false}
                        onChange={() => handleInputChange('willingToTreat', false)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500"
                      />
                      <label htmlFor="willingNo" className="flex items-center space-x-2 text-sm text-gray-700">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>No, refer to another counsellor</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sitting Notes
                  </label>
                  <textarea
                    value={formData.sittingNotes}
                    onChange={(e) => handleInputChange('sittingNotes', e.target.value)}
                    placeholder="Notes for this sitting series..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <input
                    type="checkbox"
                    id="curedSittingReason"
                    checked={formData.curedSittingReason}
                    onChange={(e) => handleInputChange('curedSittingReason', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="curedSittingReason" className="text-sm text-gray-700">
                    User is cured of the reason for recommended sittings
                  </label>
                </div>
              </div>
            ) : null}

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes & Recommendations
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional observations, recommendations, or notes..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CounsellorReview;