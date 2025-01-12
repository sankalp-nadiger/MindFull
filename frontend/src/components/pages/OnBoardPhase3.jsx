import React, { useState } from "react";
import { Button, Form, Container } from "react-bootstrap";

const Onboardphase3 = () => {
  // Initialize state for responses and scores
  const [responses, setResponses] = useState({
    anxiety: 0,
    depression: 0,
    bipolar: 0,
    ocd: 0,
    psychotic: 0,
    ptsd: 0,
    substance: 0,
    adhd: 0,
    eating: 0,
    sleep: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send the responses to the backend (simulated)
    console.log("Responses to be sent:", responses);
    
    // You can replace this with an API call to send the data to your backend
  };

  return (
    <Container className="mt-4">
      <h2>Onboarding - Mental Wellness Assessment</h2>
      <Form onSubmit={handleSubmit}>
        <h5>1. Anxiety Disorders</h5>
        <Form.Group>
          <Form.Label>Do you often feel anxious about things that might not happen?</Form.Label>
          <Form.Check 
            type="radio" 
            label="Strongly Disagree"
            name="anxiety" 
            value={0} 
            onChange={handleChange} 
          />
          <Form.Check 
            type="radio" 
            label="Disagree"
            name="anxiety" 
            value={1} 
            onChange={handleChange} 
          />
          <Form.Check 
            type="radio" 
            label="Neutral"
            name="anxiety" 
            value={2} 
            onChange={handleChange} 
          />
          <Form.Check 
            type="radio" 
            label="Agree"
            name="anxiety" 
            value={3} 
            onChange={handleChange} 
          />
          <Form.Check 
            type="radio" 
            label="Strongly Agree"
            name="anxiety" 
            value={4} 
            onChange={handleChange} 
          />
        </Form.Group>

        <h5>2. Depression</h5>
        <Form.Group>
          <Form.Label>Do you feel like it’s harder to enjoy things you once loved?</Form.Label>
          <Form.Check 
            type="radio" 
            label="Strongly Disagree"
            name="depression" 
            value={0} 
            onChange={handleChange} 
          />
          <Form.Check 
            type="radio" 
            label="Disagree"
            name="depression" 
            value={1} 
            onChange={handleChange} 
          />
          <Form.Check 
            type="radio" 
            label="Neutral"
            name="depression" 
            value={2} 
            onChange={handleChange} 
          />
          <Form.Check 
            type="radio" 
            label="Agree"
            name="depression" 
            value={3} 
            onChange={handleChange} 
          />
          <Form.Check 
            type="radio" 
            label="Strongly Agree"
            name="depression" 
            value={4} 
            onChange={handleChange} 
          />
        </Form.Group>

        {/* Add similar questions for other disorders */}
        
        <Button type="submit" variant="primary" className="mt-3">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default Onboardphase3;
