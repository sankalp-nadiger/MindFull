import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asynchandler.utils.js";
import { ApiError } from "../utils/API_Error.js";
import ApiResponse from "../utils/API_Response.js";

// Get global leaderboard
const getGlobalLeaderboard = asyncHandler(async (req, res) => {
    const { limit = 50, page = 1 } = req.query;
    
    const users = await User.find({})
        .select('username fullName avatar maxStreak gender district state lastLoginDate')
        .sort({ maxStreak: -1 }) // Sort by maxStreak in descending order
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

    // Calculate points based on maxStreak (consistent calculation)
    const rankedUsers = users.map((user, index) => ({
        ...user,
        rank: index + 1,
        points: user.maxStreak * 10, // Simplified point calculation - no random
        lastActive: user.lastLoginDate ? getTimeAgo(user.lastLoginDate) : 'Unknown'
    }));

    return res.status(200).json(
        new ApiResponse(200, rankedUsers, "Global leaderboard fetched successfully")
    );
});

// Get district-wise leaderboard
const getDistrictLeaderboard = asyncHandler(async (req, res) => {
    const { district, limit = 20 } = req.query;

    let matchQuery = {};
    if (district) {
        matchQuery.district = district;
    }

    const users = await User.find(matchQuery)
        .select('username fullName avatar maxStreak gender district state lastLoginDate')
        .sort({ maxStreak: -1 })
        .limit(parseInt(limit))
        .lean();

    // Calculate points and ranking (consistent with global)
    const rankedUsers = users.map((user, index) => ({
        ...user,
        rank: index + 1,
        points: user.maxStreak * 10, // Consistent point calculation
        lastActive: user.lastLoginDate ? getTimeAgo(user.lastLoginDate) : 'Unknown'
    }));

    return res.status(200).json(
        new ApiResponse(200, rankedUsers, `District leaderboard fetched successfully`)
    );
});

// Get district statistics
const getDistrictStats = asyncHandler(async (req, res) => {
    const districtStats = await User.aggregate([
        {
            $match: {
                district: { $exists: true, $ne: null, $ne: "" }
            }
        },
        {
            $group: {
                _id: "$district",
                userCount: { $sum: 1 },
                totalmaxStreak: { $sum: "$maxStreak" },
                avgmaxStreak: { $avg: "$maxStreak" },
                maxmaxStreak: { $max: "$maxStreak" },
                users: {
                    $push: {
                        _id: "$_id",
                        username: "$username",
                        fullName: "$fullName",
                        avatar: "$avatar",
                        maxStreak: "$maxStreak",
                        gender: "$gender",
                        lastLoginDate: "$lastLoginDate"
                    }
                }
            }
        },
        {
            $project: {
                name: "$_id",
                userCount: 1,
                totalPoints: { $multiply: ["$totalmaxStreak", 10] }, // Consistent multiplier
                avgPoints: { $multiply: ["$avgmaxStreak", 10] },
                maxmaxStreak: 1,
                topUsers: {
                    $slice: [
                        {
                            $sortArray: {
                                input: "$users",
                                sortBy: { maxStreak: -1 }
                            }
                        },
                        5
                    ]
                }
            }
        },
        {
            $sort: { totalPoints: -1 }
        }
    ]);

    // Add rank and enhance data
    const enhancedStats = districtStats.map((district, index) => ({
        ...district,
        rank: index + 1,
        topUsers: district.topUsers.map((user, userIndex) => ({
            ...user,
            points: user.maxStreak * 10, // Consistent calculation
            rank: userIndex + 1,
            lastActive: user.lastLoginDate ? getTimeAgo(user.lastLoginDate) : 'Unknown'
        }))
    }));

    return res.status(200).json(
        new ApiResponse(200, enhancedStats, "District statistics fetched successfully")
    );
});

// Get user's leaderboard position
const getUserPosition = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    // Get user's current data
    const user = await User.findById(userId)
        .select('username fullName avatar maxStreak gender district state lastLoginDate maxmaxStreak')
        .lean();

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Calculate user's global rank
    const usersAhead = await User.countDocuments({
        maxStreak: { $gt: user.maxStreak }
    });

    // Calculate user's district rank if district exists
    let districtRank = null;
    if (user.district) {
        const usersAheadInDistrict = await User.countDocuments({
            district: user.district,
            maxStreak: { $gt: user.maxStreak }
        });
        districtRank = usersAheadInDistrict + 1;
    }

    // Get user above and below for motivation
    const userAbove = await User.findOne({
        maxStreak: { $gt: user.maxStreak }
    })
    .select('username maxStreak')
    .sort({ maxStreak: 1 })
    .lean();

    const userBelow = await User.findOne({
        maxStreak: { $lt: user.maxStreak }
    })
    .select('username maxStreak')
    .sort({ maxStreak: -1 })
    .lean();

    const userPosition = {
        ...user,
        globalRank: usersAhead + 1,
        districtRank,
        points: user.maxStreak * 10, // Consistent calculation
        lastActive: user.lastLoginDate ? getTimeAgo(user.lastLoginDate) : 'now',
        userAbove,
        userBelow,
        pointsToNextRank: userAbove ? (userAbove.maxStreak - user.maxStreak) * 10 : 0
    };

    return res.status(200).json(
        new ApiResponse(200, userPosition, "User position fetched successfully")
    );
});

// Get top performers (top 10)
const getTopPerformers = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const topUsers = await User.find({})
        .select('username fullName avatar maxStreak gender district state lastLoginDate')
        .sort({ maxStreak: -1 })
        .limit(parseInt(limit))
        .lean();

    const enhancedUsers = topUsers.map((user, index) => ({
    ...user,
    rank: index + 1,
    points: user.maxStreak * 10,
    currentStreak: calculateCurrentStreak(user.lastLoginDate), // Current streak
    maxStreak: user.maxStreak || 0,  // Best streak ever
    lastActive: user.lastLoginDate ? getTimeAgo(user.lastLoginDate) : 'Unknown',
    badges: generateBadges(user)
}));

    return res.status(200).json(
        new ApiResponse(200, enhancedUsers, "Top performers fetched successfully")
    );
});

// Helper function to calculate current streak
const calculateCurrentStreak = (lastLoginDate) => {
    if (!lastLoginDate) return 0;
    
    const now = new Date();
    const lastLogin = new Date(lastLoginDate);
    const diffInDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
    
    // If logged in today or yesterday, streak continues
    if (diffInDays <= 1) {
        // You'll need additional logic here based on your app's streak rules
        // This is a simplified version - you might need to query user's activity history
        return Math.min(diffInDays === 0 ? 1 : 0, 1); // Placeholder logic
    }
    
    return 0; // Streak broken
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
};

// Helper function to generate badges based on user data
const generateBadges = (user) => {
    const badges = [];
    
    if (user.maxStreak >= 30) {
        badges.push({ type: 'fire', name: 'Fire Streak', color: 'orange' });
    }
    if (user.maxStreak * 10 >= 1000) { // Updated to use consistent calculation
        badges.push({ type: 'star', name: 'High Achiever', color: 'yellow' });
    }
    if (user.maxStreak >= 7) {
        badges.push({ type: 'target', name: 'Weekly Warrior', color: 'green' });
    }
    if (user.maxStreak && user.maxStreak >= 50) {
        badges.push({ type: 'crown', name: 'Streak Master', color: 'purple' });
    }
    
    return badges;
};

export {
    getGlobalLeaderboard,
    getDistrictLeaderboard,
    getDistrictStats,
    getUserPosition,
    getTopPerformers
};