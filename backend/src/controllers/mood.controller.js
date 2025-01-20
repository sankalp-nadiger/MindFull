const saveUserMood = async (userId, moodValue) => {
    try {
      const newMood = new Mood({
        user: userId,
        mood: moodValue,
      });
  
      await newMood.save();
  
      console.log("Mood saved successfully:", newMood);
      return newMood;
    } catch (error) {
      console.error("Error saving mood:", error);
      throw new Error("Failed to save mood");
    }
  };

  export {saveUserMood}