import React, { useState } from "react";
import { Button, Form, Container } from "react-bootstrap";
import "./OnboardPhase3.css"; // Include the CSS file for styling

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses((prev) => ({
      ...prev,
      [name]: Number(value), // Ensure value is saved as a number
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Responses to be sent:", responses);
    // Replace with API call to send responses to the backend
  };

  return (
    <Container className="mt-4">
      <h2>Lets know u more!!</h2>
      <Form onSubmit={handleSubmit}>
        {/* Anxiety Disorders */}
    
        <Form.Group>
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
        <h5> </h5>
        <Form.Group>
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
        <h5></h5>
        <Form.Group>
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
        <h5></h5>
        <Form.Group>
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
        <h5></h5>
        <Form.Group>
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

        <Button type="submit" variant="primary" className="mt-3">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default OnboardPhase3;
