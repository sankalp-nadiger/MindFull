import React, { useState } from "react";
import "./TermsModal.css";

const TermsModal = ({ isOpen, onClose, onAccept, viewOnly = false }) => {
  const [agreements, setAgreements] = useState({
    termsConditions: false,
    privacyPolicy: false,
    ageRequirement: false
  });

  if (!isOpen) return null;

  const handleCheckboxChange = (key) => {
    setAgreements(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const allChecked = agreements.termsConditions && agreements.privacyPolicy && agreements.ageRequirement;

  const handleAccept = () => {
    if (allChecked) {
      onAccept();
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && (allChecked || viewOnly)) {
      onClose();
    }
  };

  return (
    <div className="terms-modal-overlay" onClick={handleOverlayClick}>
      <div className="terms-modal-container">
        <div className="terms-modal-header">
          <h2 className="terms-modal-title">Terms of Use & Consent</h2>
          {(allChecked || viewOnly) && (
            <button
              className="terms-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>

        <div className="terms-modal-body">
          <div className="terms-modal-content">
            <section className="terms-section">
            <h3 className="terms-section-title">User Agreement & Consent</h3>
            <ul className="terms-list">
              <li>I confirm that I am at least 18 years old, OR between 13–17 years old with valid parental/guardian consent. Users under 13 may not register as an individual account.</li>
              <li>If you are under 18 years of age, your account will remain inactive until parental or legal guardian consent is verified.</li>
              <li>Soulynk is not an emergency mental health service. If you are experiencing a crisis or suicidal thoughts, please contact your local emergency services immediately.</li>
              <li>I understand that the Soulynk Bot provides automated responses and does not replace professional medical or psychological advice.</li>
              <li>I consent to the collection, storage, and processing of my personal and wellness-related data as described in the Privacy Policy.</li>
              <li>I agree to follow the Community Guidelines and understand that abusive, harmful, or illegal behavior may result in account suspension or termination.</li>
              <li>I acknowledge that my acceptance of these Terms will be electronically recorded, including timestamp and IP address, for legal compliance purposes.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">Non-Medical Disclaimer</h3>
            <p className="terms-paragraph">
              Soulynk is a digital wellness and self-support platform and does not provide medical, psychiatric, psychological, or clinical healthcare services.
            </p>
            <p className="terms-paragraph">
              The content, tools, AI chatbot responses, journaling features, community discussions, and meditation resources are for informational and self-development purposes only and are not intended to diagnose, treat, cure, or prevent any mental health condition.
            </p>
            <p className="terms-paragraph">
              Use of the Platform does not create a doctor-patient, therapist-patient, or clinical relationship between the User and Soulynk.
            </p>
            <p className="terms-paragraph important">
              If you are experiencing a medical or psychological emergency, including suicidal thoughts, you must immediately contact local emergency services or a licensed healthcare professional.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">Electronic Consent & Record Retention</h3>
            <p className="terms-paragraph">
              The User agrees that this electronic acceptance constitutes a legally binding agreement equivalent to a signature.
            </p>
            <p className="terms-paragraph">
              Soulynk shall maintain secure electronic records of consent, including but not limited to timestamp, IP address, device information, and acceptance version. Such records shall serve as legally admissible evidence of agreement in the event of any dispute.
            </p>
          </section>

          <section className="terms-section">
            <h3 className="terms-section-title">Prohibited Use & Misconduct</h3>
            <p className="terms-paragraph">
              The User agrees not to misuse the Platform in any manner, including but not limited to:
            </p>
            <ul className="terms-list">
              <li>Posting abusive, threatening, illegal, or harmful content</li>
              <li>Promoting self-harm or violence</li>
              <li>Harassing other users</li>
              <li>Impersonating another individual</li>
              <li>Providing false age or identity information</li>
              <li>Attempting to hack, disrupt, reverse engineer, or exploit the Platform</li>
            </ul>
            <p className="terms-paragraph">
              Platform reserves the right, at its sole discretion, to suspend, restrict, or permanently terminate accounts engaged in prohibited conduct without prior notice.
            </p>
            <p className="terms-paragraph">
              Platform shall not be liable for user-generated content or the actions of other users.
            </p>
            <p className="terms-paragraph">
              The participation in wellness discussions and community interactions involves inherent emotional risk and agrees to use the Platform at their own discretion and responsibility.
            </p>
          </section>

          <section className="terms-section warning-section">
            <h3 className="terms-section-title">Legal Action for Serious Violations</h3>
            <p className="terms-paragraph">
              In the event of serious misconduct, unlawful activity, or violation of applicable laws, Soulynk reserves the right to initiate appropriate legal proceedings against the User.
            </p>
            <p className="terms-paragraph">
              This may include, where applicable:
            </p>
            <ul className="terms-list">
              <li>Filing a formal police complaint or First Information Report (FIR)</li>
              <li>Cooperating fully with law enforcement authorities</li>
              <li>Providing user data as required under lawful government request or court order</li>
              <li>Initiating civil or criminal legal action for damages</li>
            </ul>
            <p className="terms-paragraph">
              Users shall not engage in any unlawful, abusive, harmful, fraudulent, threatening, defamatory, harassing, obscene, or otherwise inappropriate conduct while using the Platform.
            </p>
            <p className="terms-paragraph">
              This includes, but is not limited to:
            </p>
            <ul className="terms-list">
              <li>Cyberbullying or harassment</li>
              <li>Threats of violence</li>
              <li>Promotion of self-harm</li>
              <li>Sharing illegal content</li>
              <li>Hate speech</li>
              <li>Impersonation or identity fraud</li>
              <li>Unauthorized access attempts or hacking</li>
              <li>Distribution of malicious software</li>
              <li>Posting sexually explicit content involving minors</li>
            </ul>
          </section>
          </div>

          <div className="terms-modal-sidebar">
            {!viewOnly && (
              <>
                <div className="sidebar-header">
                  <h3 className="sidebar-title">Required Agreements</h3>
                  <p className="sidebar-subtitle">Please review and accept all terms to continue</p>
                </div>
                <div className="terms-checkboxes">
                <label className="terms-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreements.termsConditions}
                    onChange={() => handleCheckboxChange('termsConditions')}
                    className="terms-checkbox"
                  />
                  <span className="terms-checkbox-text">I agree to the Terms & Conditions</span>
                </label>

                <label className="terms-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreements.privacyPolicy}
                    onChange={() => handleCheckboxChange('privacyPolicy')}
                    className="terms-checkbox"
                  />
                  <span className="terms-checkbox-text">I accept the Privacy Policy</span>
                </label>

                <label className="terms-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreements.ageRequirement}
                    onChange={() => handleCheckboxChange('ageRequirement')}
                    className="terms-checkbox"
                  />
                  <span className="terms-checkbox-text">I confirm I meet the age requirements</span>
                </label>
              </div>

                <button
                  className={`terms-accept-button ${!allChecked ? 'disabled' : ''}`}
                  onClick={handleAccept}
                  disabled={!allChecked}
                >
                  {allChecked ? 'Accept & Continue' : 'Please accept all terms to continue'}
                </button>
              </>
            )}
            {viewOnly && (
              <div className="sidebar-center">
                <button
                  className="terms-accept-button"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
