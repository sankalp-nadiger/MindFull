import Resource from '../models/resource.model'; // Import the Resource model
import Interest from '../models/interest.model'; // Import the Interest model

// Simulated ML Model function (replace with actual ML model code)
const generateResourceFromML = (interests) => {
  // Example of how an ML model might generate data based on interests
  // This is a simulation; replace with the real logic that calls your ML model
  const resource = {
    type: 'article', // Example type
    title: `Resource for ${interests.map((interest) => interest.name).join(', ')}`, // Generated title based on interests
    content: `This is a generated resource content based on the interests: ${interests
      .map((interest) => interest.name)
      .join(', ')}.`, // Generated content based on interests
  };
  return resource;
};

// Controller function to create and store a resource
export const createResource = async (req, res) => {
  try {
    // Fetch the interests from the request body
    const { interestIds } = req.body;

    // Fetch the interest documents from the database
    const interests = await Interest.find({ '_id': { $in: interestIds } });

    if (!interests || interests.length === 0) {
      return res.status(400).json({ message: 'No valid interests found.' });
    }

    // Call the ML model to generate a resource based on the interests
    const resourceData = generateResourceFromML(interests);

    // Create a new resource document to store in the database
    const resource = new Resource({
      title: resourceData.title,
      type: resourceData.type,
      content: resourceData.content,
      interests: interestIds, // Store the provided interest IDs
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
