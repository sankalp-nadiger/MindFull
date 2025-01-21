import React, { useState } from "react";
import { Button, Form, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API calls
import "./OnboardPhase3.css";

const OnboardPhase3 = () => {
  const [responses, setResponses] = useState({
    anxiety: 0,
    depression: 0,
    bipolar: 0,
    ocd: 0,
    ptsd: 0,
    substance: 0,
    adhd: 0,
    eating: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Handle submission state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses((prev) => ({
      ...prev,
      [name]: Number(value), // Ensure value is saved as a number
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Assuming you have a way to get the current logged-in user's ID
    const userId = "678eb93145dd095192be902d"
 // Replace this with the actual user ID (from context, auth, or props)
    
    if (!userId) {
      alert("User not authenticated");
      return;
    }

    // Mapping the responses to the issue names (you need to ensure these are the same as in your backend)
    const issueMapping = {
      anxiety: "Anxiety",
      depression: "Depression",
      bipolar: "Bipolar Disorder",
      ocd: "Obsessive-Compulsive Disorder",
      ptsd: "PTSD",
      substance: "Substance Use",
      adhd: "ADHD",
      eating: "Eating Disorders",
    };

    // Only include issues where the user selected a response (non-zero value)
    const diagnoised_issues = Object.keys(responses).filter(
      (key) => responses[key] !== 0 // Only include issues where the user selected a response
    ).map((key) => issueMapping[key]); // Map the issue names to the actual names

    if (diagnoised_issues.length === 0) {
      alert("Please select at least one issue.");
      return;
    }

    const userData = {
      userId,
      diagnoised_issues, // Send only the issue names here
    };

    try {
      setIsSubmitting(true);
      // API call to submit responses
      const response = await axios.post("http://localhost:8000/api/users/add-issues", userData);
      console.log("API Response:", response.data);
      alert("Your responses have been saved successfully!");
      // Navigate to the main page after form submission
      navigate("/");
    } catch (error) {
      console.error("Error submitting responses:", error);
      alert("Failed to submit your responses. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Let's know you more!!</h2>
      <Form onSubmit={handleSubmit}>
        {/* Anxiety Disorders */}
        <Form.Group controlId="anxiety" className="mb-3">
          <Form.Label>
            You’re getting ready for a big event, but the thought of it keeps
            you up all night. Do you often feel anxious about things that might
            not happen?
          </Form.Label>
          {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(
            (label, index) => (
              <Form.Check
                key={`anxiety-${index}`}
                type="radio"
                label={label}
                name="anxiety"
                value={index}
                onChange={handleChange}
              />
            )
          )}
        </Form.Group>

        {/* Depression */}
        <Form.Group controlId="depression" className="mb-3">
          <Form.Label>
            You’re sitting with friends who are laughing and enjoying
            themselves, but you feel like you can’t join in. Do you often feel
            disconnected or uninterested in things you used to enjoy?
          </Form.Label>
          {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(
            (label, index) => (
              <Form.Check
                key={`depression-${index}`}
                type="radio"
                label={label}
                name="depression"
                value={index}
                onChange={handleChange}
              />
            )
          )}
        </Form.Group>

        {/* Bipolar Disorder */}
        <Form.Group controlId="bipolar" className="mb-3">
          <Form.Label>
            One day, you feel like you can take on the world, full of energy and
            ideas, but the next day, it’s hard to even get out of bed. Do you
            experience drastic changes in your energy and mood?
          </Form.Label>
          {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(
            (label, index) => (
              <Form.Check
                key={`bipolar-${index}`}
                type="radio"
                label={label}
                name="bipolar"
                value={index}
                onChange={handleChange}
              />
            )
          )}
        </Form.Group>

        {/* Add remaining fields similarly... */}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="mt-3"
          disabled={isSubmitting} // Disable button while submitting
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </Form>
    </Container>
  );
};

export default OnboardPhase3;
