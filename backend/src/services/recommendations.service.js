// services/recommendations.service.js
import axios from 'axios';
import cheerio from 'cheerio';
import Issue from '../models/issue.model.js';
import Interest from '../models/interest.model.js';

export const fetchOnlineResource = async (url) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        return {
            title: $('title').text() || $('h1').first().text(),
            description: $('meta[name="description"]').attr('content') || 
                        $('p').first().text().substring(0, 200),
            keywords: $('meta[name="keywords"]').attr('content') || '',
            type: determineResourceType(url)
        };
    } catch (error) {
        console.error(`Error fetching URL ${url}:`, error);
        return null;
    }
};

export const personalizeRecommendations = async (resources, userId, interests) => {
    try {
        // Fetch user's issues and goals
        const userIssues = await Issue.find({ users: userId });
        const userGoals = await Interest.find({ 
            user: userId, 
            isGoal: true 
        });

        // Calculate relevance scores
        const scoredResources = resources.map(resource => ({
            ...resource,
            score: calculateRelevanceScore(resource, userIssues, userGoals, interests)
        }));

        // Group by type and sort by score
        const groupedRecommendations = {
            books: [],
            videos: [],
            blogs: [],
            podcasts: [],
            events: [],
            courses: [],
            websites: [],
            repositories: []
        };

        scoredResources.forEach(resource => {
            const type = resource.type.toLowerCase();
            if (groupedRecommendations[type]) {
                groupedRecommendations[type].push(resource);
            }
        });

        // Sort each category by score and limit to top 10
        Object.keys(groupedRecommendations).forEach(type => {
            groupedRecommendations[type] = groupedRecommendations[type]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
        });

        return groupedRecommendations;
    } catch (error) {
        console.error('Error in personalizeRecommendations:', error);
        throw error;
    }
};

function calculateRelevanceScore(resource, issues, goals, interests) {
    let score = 0;

    // Score based on matching interests
    const matchingInterests = resource.related_interest
        .filter(interest => interests.includes(interest)).length;
    score += matchingInterests * 2;

    // Score based on matching issues
    issues.forEach(issue => {
        if (resource.content?.toLowerCase().includes(issue.name.toLowerCase())) {
            score += 1;
        }
    });

    // Score based on matching goals
    goals.forEach(goal => {
        if (resource.content?.toLowerCase().includes(goal.name.toLowerCase())) {
            score += 1.5;
        }
    });

    return score;
}

function determineResourceType(url) {
    if (url.includes('youtube.com') || url.includes('vimeo.com')) return 'video';
    if (url.includes('medium.com') || url.includes('dev.to')) return 'blog';
    if (url.includes('coursera.org') || url.includes('udemy.com')) return 'course';
    if (url.includes('github.com')) return 'repository';
    return 'website';
}
