// controllers/recommendations.controller.js
import axios from 'axios';
import { personalizeRecommendations } from '../services/recommendations.service.js';

export const fetchRecommendations = async (req, res) => {
    try {
        const { userId, interests: userInterests } = req.body;
        if (!userId || !userInterests || !Array.isArray(userInterests)) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Missing required fields. Please provide userId and interests array.' 
            });
        }

        // Fetch dynamic resources based on interests
        const fetchedResources = await fetchExternalResources(userInterests);

        // Validate and enrich resources with online content
        const validatedOnlineResources = await Promise.all(
            fetchedResources.map(async (resource) => {
                if (resource.url) {
                    const onlineContent = await fetchOnlineResource(resource.url);
                    if (onlineContent) {
                        return {
                            ...resource,
                            ...onlineContent,
                            source: 'online'
                        };
                    }
                }
                return resource;
            })
        );

        // Get personalized recommendations
        const recommendations = await personalizeRecommendations(
            validatedOnlineResources,
            userId,
            userInterests
        );

        res.status(200).json({
            status: 'success',
            data: recommendations,
            metadata: {
                totalRecommendations: Object.values(recommendations)
                    .reduce((acc, curr) => acc + curr.length, 0),
                interestsMatched: userInterests,
                onlineResourcesCount: validatedOnlineResources.length
            }
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
    const maxResults = 5; // Limit the number of results per interest

    for (const interest of interests) {
        try {
            // Example using Google Books API for books
            const bookResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(interest)}&maxResults=${maxResults}`);
            const bookResources = bookResponse.data.items || [];
            bookResources.forEach((book) => {
                fetchedResources.push({
                    title: book.volumeInfo.title,
                    description: book.volumeInfo.description || '',
                    url: book.volumeInfo.infoLink || '',
                    type: 'book', // Adjust type based on API response
                    related_interest: [interest],
                    watched: false,
                    user: null, // Placeholder, can be populated later
                    available: true,
                    source: 'online'
                });
            });

            // Example using YouTube Data API for videos
            const videoResponse = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(interest)}&maxResults=${maxResults}&type=video&key=YOUR_YOUTUBE_API_KEY`);
            const videoResources = videoResponse.data.items || [];
            videoResources.forEach((video) => {
                fetchedResources.push({
                    title: video.snippet.title,
                    description: video.snippet.description || '',
                    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                    type: 'video', // Adjust type based on API response
                    related_interest: [interest],
                    watched: false,
                    user: null, // Placeholder, can be populated later
                    available: true,
                    source: 'online'
                });
            });

            // Example using Medium API for blogs
            const mediumResponse = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/tag/${encodeURIComponent(interest)}&count=${maxResults}`);
            const mediumResources = mediumResponse.data.items || [];
            mediumResources.slice(0, maxResults).forEach((blog) => {
                fetchedResources.push({
                    title: blog.title,
                    description: blog.description || '',
                    url: blog.link || '',
                    type: 'blog', // Adjust type based on API response
                    related_interest: [interest],
                    watched: false,
                    user: null, // Placeholder, can be populated later
                    available: true,
                    source: 'online'
                });
            });

            // Example using Spotify Web API for podcasts
            const spotifyResponse = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(interest)}&type=podcast&limit=${maxResults}`, {
                headers: {
                    'Authorization': 'Bearer YOUR_SPOTIFY_ACCESS_TOKEN'
                }
            });
            const podcastResources = spotifyResponse.data.podcasts?.items || [];
            podcastResources.slice(0, maxResults).forEach((podcast) => {
                fetchedResources.push({
                    title: podcast.name,
                    description: podcast.description || '',
                    url: podcast.external_urls.spotify || '',
                    type: 'podcast', // Adjust type based on API response
                    related_interest: [interest],
                    watched: false,
                    user: null, // Placeholder, can be populated later
                    available: true,
                    source: 'online'
                });
            });

            // Example using Eventbrite API for events
            const eventResponse = await axios.get(`https://www.eventbriteapi.com/v3/events/search/?q=${encodeURIComponent(interest)}&token=YOUR_EVENTBRITE_TOKEN`, {
                params: { 
                    "expand": "venue",
                    "page_size": maxResults
                }
            });
            const eventResources = eventResponse.data.events || [];
            eventResources.slice(0, maxResults).forEach((event) => {
                fetchedResources.push({
                    title: event.name.text,
                    description: event.description.text || '',
                    url: event.url || '',
                    type: 'event', // Adjust type based on API response
                    related_interest: [interest],
                    watched: false,
                    user: null, // Placeholder, can be populated later
                    available: true,
                    source: 'online'
                });
            });

        } catch (error) {
            console.error(`Error fetching resources for interest ${interest}:`, error);
        }
    }

    return fetchedResources;
}
