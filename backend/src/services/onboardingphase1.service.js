import express from 'express';
import cors from 'cors';
import { pipeline } from '@xenova/transformers';

const app = express();
app.use(cors());
app.use(express.json());

// Load the sentiment analysis model
(async () => {
  try {
    const sentimentAnalysis = await pipeline('sentiment-analysis', 'distilbert-base-uncased');
    console.log('Model loaded successfully.');

    app.get('/', (req, res) => {
      res.json({ message: 'Sentiment Analysis API is running!' });
    });

    app.post('/analyze', async (req, res) => {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'No text provided' });
      }

      try {
        const result = await sentimentAnalysis(text);
        console.log(`Raw Result: ${JSON.stringify(result)}`); // Debugging line

        const sentiment = mapLabel(result[0].label);
        const responseMessage = getResponseMessage(sentiment);

        res.json({ sentiment, response: responseMessage });
      } catch (error) {
        res.status(500).json({ error: 'Error processing the request', details: error.message });
      }
    });

    function mapLabel(label) {
      // Adjust the mapping based on your model's output
      if (label === 'LABEL_0') {
        return 'NEGATIVE';
      } else if (label === 'LABEL_1') {
        return 'POSITIVE';
      } else {
        return 'NEUTRAL';
      }
    }

    function getResponseMessage(sentiment) {
      if (sentiment === 'POSITIVE') {
        return "That's great! Keep up the good mood!";
      } else if (sentiment === 'NEGATIVE') {
        return "I'm sorry to hear that. Let me know how I can help.";
      } else {
        return "Interesting! Tell me more about it.";
      }
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error loading the model:', error);
  }
})();
