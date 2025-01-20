// recommendstions Controller
import axios from 'axios';
import Resource from '../models/resource.model';
import Interest from '../models/interests.model';
import Issue from '../models/issue.model';

export const fetchRecommendations = async (req, res) => {
  try {
    const { userId, interests: userInterests, issues: userIssues, goals: userGoals } = req.body;

    if (!userId || !Array.isArray(userInterests) || !Array.isArray(userIssues) || !Array.isArray(userGoals)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing or invalid required fields. Please provide userId, interests, issues, and goals arrays.'
      });
    }
      
    // Fetch user's watched resources to exclude them from recommendations
    const watchedResources = await Resource.find({ user: userId, watched: true });
    const watchedIds = watchedResources.map((resource) => resource._id.toString());

    // Fetch dynamic resources based on interests, issues, and goals
    const fetchedResources = await fetchExternalResources([...userInterests, ...userIssues, ...userGoals]);

    // Filter out already watched resources
    const filteredResources = fetchedResources.filter(resource => 
      !watchedIds.includes(resource.url) && resource.available
    );

    // Save new recommendations to the database
    const resourcesToSave = filteredResources.map(resource => ({
      ...resource,
      user: userId,
      related_interest: resource.related_interest,
      related_issues: userIssues,
      related_goals: userGoals
    }));

    const savedResources = await Resource.insertMany(resourcesToSave);

    res.status(200).json({
      status: 'success',
      message: 'Recommendations fetched and saved successfully.',
      data: savedResources
    });
  } catch (error) {
    console.error('Error in fetchRecommendations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
};

async function fetchExternalResources(interests) {
  const fetchedResources = [];
  const maxResults = 5;

  for (const interest of interests) {
    try {
      // Google Books API for books
      const bookResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(interest)}&maxResults=${maxResults}`);
      (bookResponse.data.items || []).forEach(book => {
        fetchedResources.push({
          title: book.volumeInfo.title,
          description: book.volumeInfo.description || '',
          url: book.volumeInfo.infoLink || '',
          type: 'book',
          related_interest: [interest],
          watched: false,
          available: true
        });
      });

      // YouTube Data API for videos
      const videoResponse = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(interest)}&maxResults=${maxResults}&type=video&key=AIzaSyAKONN4jJvULvjKLIpbkd1U-Bioq2zrDIs`);
      (videoResponse.data.items || []).forEach(video => {
        fetchedResources.push({
          title: video.snippet.title,
          description: video.snippet.description || '',
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          type: 'video',
          related_interest: [interest],
          watched: false,
          available: true
        });
      });

      // Medium API for blogs
      const mediumResponse = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/tag/${encodeURIComponent(interest)}&count=${maxResults}`);
      (mediumResponse.data.items || []).forEach(blog => {
        fetchedResources.push({
          title: blog.title,
          description: blog.description || '',
          url: blog.link || '',
          type: 'blog',
          related_interest: [interest],
          watched: false,
          available: true
        });
      });

      // Spotify Web API for podcasts
      const spotifyResponse = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(interest)}&type=podcast&limit=${maxResults}`, {
        headers: { 'Authorization': 'Bearer YOUR_SPOTIFY_ACCESS_TOKEN' }
      });
      (spotifyResponse.data.podcasts?.items || []).forEach(podcast => {
        fetchedResources.push({
          title: podcast.name,
          description: podcast.description || '',
          url: podcast.external_urls.spotify || '',
          type: 'podcast',
          related_interest: [interest],
          watched: false,
          available: true
        });
      });

      // Eventbrite API for events
      const eventResponse = await axios.get(`https://www.eventbriteapi.com/v3/events/search/?q=${encodeURIComponent(interest)}&token=YOUR_EVENTBRITE_TOKEN`, {
        params: { "expand": "venue", "page_size": maxResults }
      });
      (eventResponse.data.events || []).forEach(event => {
        fetchedResources.push({
          title: event.name.text,
          description: event.description.text || '',
          url: event.url || '',
          type: 'event',
          related_interest: [interest],
          watched: false,
          available: true
        });
      });

    } catch (error) {
      console.error(`Error fetching resources for interest ${interest}:`, error);
    }
  }

  return fetchedResources;
}
