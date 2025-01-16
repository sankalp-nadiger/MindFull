import Resource from '../models/resource.model'; // Import the Resource model
import Interest from '../models/interest.model'; // Import the Interest model

// Simulated ML Model function (replace with actual ML model code)
const generateResourceFromML = (interests, goals, issues) => {
  // Example of how an ML model might generate data based on interests, goals, and issues
  // This is a simulation; replace with the real logic that calls your ML model

  // Generating title and content based on interests, goals, and issues
  const resource = {
    type: 'article', // Example type
    title: `Resource for ${interests.map((interest) => interest.name).join(', ')}`, // Generated title based on interests
    content: `This resource is tailored to your interests: ${interests
      .map((interest) => interest.name)
      .join(', ')}. Goals: Short-term: ${goals.shortTerm}, Long-term: ${goals.longTerm}. Issues: ${issues
      .map((issue) => `${issue.name}: ${issue.score}`)
      .join(', ')}`, // Generated content based on interests, goals, and issues
  };
  return resource;
};

// Controller function to create and store a resource
export const createResource = async (req, res) => {
  try {
    // Destructure interests, goals, and issues from the request body
    const { interestIds, goals, issues } = req.body;

    // Fetch the interest documents from the database
    const interests = await Interest.find({ '_id': { $in: interestIds } });

    if (!interests || interests.length === 0) {
      return res.status(400).json({ message: 'No valid interests found.' });
    }

    // Call the ML model to generate a resource based on interests, goals, and issues
    const resourceData = generateResourceFromML(interests, goals, issues);

    // Create a new resource document to store in the database
    const resource = new Resource({
      title: resourceData.title,
      type: resourceData.type,
      content: resourceData.content,
      interests: interestIds, // Store the provided interest IDs
      goals, // Store goals (short-term, long-term)
      issues, // Store issues (score-based)
    });

    // Save the resource to the database
    await resource.save();

    // Return the newly created resource as a response
    res.status(201).json({
      message: 'Resource created successfully.',
      data: resource,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error creating resource.',
      error: error.message,
    });
  }
};
