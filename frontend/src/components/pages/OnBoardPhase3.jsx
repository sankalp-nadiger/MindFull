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
    const userId = localStorage.getItem("userId"); // Replace this with the actual user ID (from context, auth, or props)
    
    if (!userId) {
      alert("User not authenticated");
      return;
    }

    const diagnoised_issues = Object.keys(responses).filter(
      (key) => responses[key] !== 0 // Only include issues where the user selected a response
    );

    if (diagnoised_issues.length === 0) {
      alert("Please select at least one issue.");
      return;
    }

    const userData = {
      userId,
      diagnoised_issues,
    };

    try {
      setIsSubmitting(true);
      // API call to submit responses
      const response = await axios.post("/http://localhost:8000/api/users/add-issues", userData);
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

        {/* Obsessive-Compulsive Disorder */}
        <Form.Group controlId="ocd" className="mb-3">
          <Form.Label>
            You leave your house and suddenly feel the urge to go back and check
            if the door is locked—even though you already did. Do you often feel
            the need to repeat actions or check things multiple times to feel
            secure?
          </Form.Label>
          {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(
            (label, index) => (
              <Form.Check
                key={`ocd-${index}`}
                type="radio"
                label={label}
                name="ocd"
                value={index}
                onChange={handleChange}
              />
            )
          )}
        </Form.Group>

        {/* PTSD */}
        <Form.Group controlId="ptsd" className="mb-3">
          <Form.Label>
            A sudden loud noise reminds you of a past event, and your heart
            starts racing. Do you often feel jumpy or on edge because of
            something that happened in the past?
          </Form.Label>
          {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(
            (label, index) => (
              <Form.Check
                key={`ptsd-${index}`}
                type="radio"
                label={label}
                name="ptsd"
                value={index}
                onChange={handleChange}
              />
            )
          )}
        </Form.Group>

        {/* Substance Use */}
        <Form.Group controlId="substance" className="mb-3">
          <Form.Label>
            Have you ever found yourself relying on substances to cope with stress or difficult emotions?
          </Form.Label>
          {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(
            (label, index) => (
              <Form.Check
                key={`substance-${index}`}
                type="radio"
                label={label}
                name="substance"
                value={index}
                onChange={handleChange}
              />
            )
          )}
        </Form.Group>

        {/* ADHD */}
        <Form.Group controlId="adhd" className="mb-3">
          <Form.Label>
            Do you find it hard to focus on tasks, or do you frequently lose track of time?
          </Form.Label>
          {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(
            (label, index) => (
              <Form.Check
                key={`adhd-${index}`}
                type="radio"
                label={label}
                name="adhd"
                value={index}
                onChange={handleChange}
              />
            )
          )}
        </Form.Group>

        {/* Eating Disorders */}
        <Form.Group controlId="eating" className="mb-3">
          <Form.Label>
            Do you have concerns about your eating habits or body image that affect your daily life?
          </Form.Label>
          {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(
            (label, index) => (
              <Form.Check
                key={`eating-${index}`}
                type="radio"
                label={label}
                name="eating"
                value={index}
                onChange={handleChange}
              />
            )
          )}
        </Form.Group>

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