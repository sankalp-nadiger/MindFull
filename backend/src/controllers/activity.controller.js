// Send activity recommendations directly to the frontend
export const getRecommendations = async (req, res) => {
  try {
    const recommendations = [
      { title: "Yoga for Beginners", type: "Exercise", content: "Start your day with simple yoga poses." },
      { title: "Mindfulness Meditation", type: "Mental Health", content: "Relax and focus with guided meditations." },
      { title: "Evening Walks", type: "Physical Activity", content: "Boost your mood with a 30-minute walk." },
    ];

    return res.status(200).json({
      success: true,
      message: "Activity recommendations fetched successfully.",
      data: recommendations,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations.",
    });
  }
};

