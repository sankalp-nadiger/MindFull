import axios from 'axios';
import {Resource} from '../models/resource.model.js';
import dotenv from 'dotenv';
dotenv.config();

export const fetchRecommendations = async (req, res) => {
  try {
    const { userId, watchedUrls, userPreferences } = req.body;
    const { interests = [], goals = [], issues = [] } = userPreferences || {};

    if (!userId || !userPreferences) {
      return res.status(400).json({ 
        message: 'Missing required fields.' 
      });
    }

    // Combine all user preferences for search
    const searchTerms = [
      ...(interests || []).map(i => i.name || ""),
      ...(goals || []).map(g => g.name || ""),
      ...(issues || []).map(i => i.name || "")
    ].filter(Boolean);
    console.log("Search terms:", searchTerms);
if (searchTerms.length === 0) {
  console.error("No valid search terms available.");
  return res.status(400).json({ message: "No valid search terms provided." });
}
    // Get resources for all preferences combined
    const allResources = await fetchExternalResources(searchTerms);

    // Remove watched resources
    const newResources = allResources.filter(resource => 
      !watchedUrls.includes(resource.url)
    );

    // Score resources based on relevance to all user preferences
    const scoredResources = newResources.map(resource => ({
      ...resource,
      user: userId,
      relevanceScores: {
        interests: calculateInterestRelevance(resource, interests),
        goals: calculateGoalRelevance(resource, goals),
        issues: calculateIssueRelevance(resource, issues)
      }
    }));

    // Calculate final score considering all factors
    const rankedResources = scoredResources.map(resource => ({
      ...resource,
      finalScore: (
        resource.relevanceScores.interests + 
        resource.relevanceScores.goals + 
        resource.relevanceScores.issues
      ) / 3
    }))
    .sort((a, b) => b.finalScore - a.finalScore);

const resourcesToSave = rankedResources.map(resource => ({
      title: resource.title,
      description: resource.description || "No description available",
      url: resource.url,
      type: resource.type,
      user: userId,
      watched: false,
      relevanceScore: resource.finalScore || 0,
      related_interest: [
        ...(interests || []).map(i => i?._id).filter(Boolean),  // Ensures valid interest IDs
        ...(goals || []).map(g => g?._id).filter(Boolean)       // Ensures valid goal IDs
      ],
      related_issues: (issues || []).map(i => i?._id).filter(Boolean)  // Ensures valid issue IDs
    }));
    
    for (let resource of resourcesToSave) {
      const existingResource = await Resource.findOne({ url: resource.url });
      if (existingResource) {
        console.log(`Resource with URL ${resource.url} already exists, skipping insert.`);
      } else {
        await Resource.create(resource);
        console.log(`Resource with URL ${resource.url} saved.`);
      }
    }
    
    return resourcesToSave;
    res.status(200).json({
      message: 'Recommendations fetched successfully.',
      data: resourcesToSave
    });

  } catch (error) {
    console.error('Error in fetchRecommendations:', error);
    res.status(500).json({
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
};

async function fetchExternalResources(searchTerms) {
  const resources = [];
  const maxResults = 3;
  console.log("Books API Key:", process.env.BOOKS_API_KEY);
console.log("YouTube API Key:", process.env.YOUTUBE_API_KEY);
console.log("Spotify API Key:", process.env.SPOTIFY_API_KEY);

  for (const term of searchTerms) {
    try {
      // Fetch books
      const bookResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(term)}&maxResults=${maxResults}&key=${process.env.BOOKS_API_KEY}`);
      (bookResponse.data.items || []).forEach(book => {
        resources.push({
          title: book.volumeInfo.title,
          description: book.volumeInfo.description || '',
          url: book.volumeInfo.infoLink,
          type: 'book',
          searchTerm: term
        });
      });

      // Fetch videos
      const videoResponse = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(term)}&maxResults=${maxResults}&type=video&key=${process.env.YOUTUBE_API_KEY}`);
      (videoResponse.data.items || []).forEach(video => {
        resources.push({
          title: video.snippet.title,
          description: video.snippet.description || '',
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          type: 'video',
          searchTerm: term
        });
      });

      // Fetch blogs
      /*const blogResponse = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/tag/${encodeURIComponent(term)}&count=${maxResults}&api_key=${process.env.MEDIUM_API_KEY}`);
      (blogResponse.data.items || []).forEach(blog => {
        resources.push({
          title: blog.title,
          description: blog.description || '',
          url: blog.link,
          type: 'blog',
          searchTerm: term
        });
      });*/

      // Fetch podcasts (Spotify)
      /*const spotifyResponse = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(term)}&type=podcast&limit=${maxResults}`, {
        headers: { 'Authorization': `Bearer ${process.env.SPOTIFY_API_KEY}` }
      });
      (spotifyResponse.data.podcasts?.items || []).forEach(podcast => {
        resources.push({
          title: podcast.name,
          description: podcast.description || '',
          url: podcast.external_urls.spotify,
          type: 'podcast',
          searchTerm: term
        });
      });*/

    } catch (error) {
      console.error(`Error fetching resources for term ${term}:`, error.message);
    }
  }

  return resources;
}


function calculateInterestRelevance(resource, interests) {
  let score = 0;
  interests.forEach(interest => {
    if (
      resource.title.toLowerCase().includes(interest.name.toLowerCase()) ||
      resource.description.toLowerCase().includes(interest.name.toLowerCase()) ||
      resource.searchTerm.toLowerCase() === interest.name.toLowerCase()
    ) {
      score += 1;
    }
  });
  return score / interests.length;
}

function calculateGoalRelevance(resource, goals) {
  let score = 0;
  goals.forEach(goal => {
    if (
      resource.title.toLowerCase().includes(goal.name.toLowerCase()) ||
      resource.description.toLowerCase().includes(goal.name.toLowerCase()) ||
      resource.searchTerm.toLowerCase() === goal.name.toLowerCase()
    ) {
      score += 1;
    }
  });
  return score / goals.length;
}

function calculateIssueRelevance(resource, issues) {
  let score = 0;
  issues.forEach(issue => {
    if (
      resource.title.toLowerCase().includes(issue.name.toLowerCase()) ||
      resource.description.toLowerCase().includes(issue.name.toLowerCase()) ||
      resource.searchTerm.toLowerCase() === issue.name.toLowerCase()
    ) {
      score += 1;
    }
  });
  return score / issues.length;
}