import express from 'express';
import router from express.Router();
import User from '../models/User';
import Mood from '../models/Mood';
import Journal from '../models/Journal';

router.get('/generate-report', async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch user data
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch mood logs for the past month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const moods = await Mood.find({
      user: userId,
      timestamp: { $gte: oneMonthAgo },
    });

    // Fetch journal entries for the past month
    const journals = await Journal.find({
      user: userId,
      createdAt: { $gte: oneMonthAgo },
    });

    // Calculate average mood
    const avgMood =
      moods.reduce((sum, mood) => sum + mood.value, 0) / (moods.length || 1);

    // Construct report data
    const report = {
      name: user.name,
      email: user.email,
      avgMood: avgMood.toFixed(2),
      totalJournals: journals.length,
      generatedAt: new Date(),
    };

    res.status(200).json({ message: "Report generated successfully", report });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Error generating report" });
  }
});

export default router;
