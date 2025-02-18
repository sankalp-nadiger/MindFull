import axios from 'axios';
import {Resource} from '../models/resource.model.js';
import dotenv from 'dotenv';
dotenv.config();

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

    const searchTerms = [
      ...(interests || []).map(i => i.name || ""),
      ...(goals || []).map(g => g.name || ""),
      ...(issues || []).map(i => i.name || "")
    ].filter(Boolean);

    if (searchTerms.length === 0) {
      console.error("No valid search terms available.");
      return res.status(400).json({ message: "No valid search terms provided." });
    }

    // Fetch more resources initially to account for filtering
    const allResources = await fetchExternalResources(searchTerms, watchedUrls);

    // Score resources based on relevance to all user preferences
    const scoredResources = allResources.map(resource => ({
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
        ...(interests || []).map(i => i?._id).filter(Boolean),
        ...(goals || []).map(g => g?._id).filter(Boolean)
      ],
      related_issues: (issues || []).map(i => i?._id).filter(Boolean)
    }));
    
    // Save new resources to database
    for (let resource of resourcesToSave) {
      try {
        const existingResource = await Resource.findOne({ url: resource.url });
        if (!existingResource) {
          await Resource.create(resource);
          console.log(`Resource with URL ${resource.url} saved.`);
        }
      } catch (error) {
        console.error(`Error saving resource ${resource.url}:`, error);
        // Continue with the loop even if one save fails
      }
    }
    
    // Send response with the recommendations
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

async function fetchExternalResources(searchTerms, watchedUrls) {
  const resources = [];
  // Increase maxResults to account for watched resources that will be filtered
  const maxResults = 10;  // Increased from 3 to 10

  for (const term of searchTerms) {
    try {
      // Fetch books
      const bookResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(term)}&maxResults=${maxResults}&key=${process.env.BOOKS_API_KEY}`);
      const bookResources = (bookResponse.data.items || [])
        .filter(book => !watchedUrls.includes(book.volumeInfo.infoLink))
        .map(book => ({
          title: book.volumeInfo.title,
          description: book.volumeInfo.description || '',
          url: book.volumeInfo.infoLink,
          type: 'book',
          searchTerm: term
        }));
      resources.push(...bookResources);

      // Fetch videos
      const videoResponse = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(term)}&maxResults=${maxResults}&type=video&key=${process.env.YOUTUBE_API_KEY}`);
      const videoResources = (videoResponse.data.items || [])
        .filter(video => !watchedUrls.includes(`https://www.youtube.com/watch?v=${video.id.videoId}`))
        .map(video => ({
          title: video.snippet.title,
          description: video.snippet.description || '',
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          type: 'video',
          searchTerm: term
        }));
      resources.push(...videoResources);

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