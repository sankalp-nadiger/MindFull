import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asynchandler.utils.js";
import { ApiError } from "../utils/API_Error.js";
import ApiResponse from "../utils/API_Response.js";

// Get global leaderboard
const getGlobalLeaderboard = asyncHandler(async (req, res) => {
    const { limit = 50, page = 1 } = req.query;
    
    const users = await User.find({})
        .select('username fullName avatar streak gender district state lastLoginDate')
        .sort({ streak: -1 }) // Sort by streak (you can change this to points if you add a points field)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

    // Calculate points based on streak (you can modify this logic)
    const rankedUsers = users.map((user, index) => ({
        ...user,
        rank: index + 1,
        points: user.streak * 15 + Math.floor(Math.random() * 100), // Example point calculation
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
        .select('username fullName avatar streak gender district state lastLoginDate')
        .sort({ streak: -1 })
        .limit(parseInt(limit))
        .lean();

    // Calculate points and ranking
    const rankedUsers = users.map((user, index) => ({
        ...user,
        rank: index + 1,
        points: user.streak * 15 + Math.floor(Math.random() * 100),
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
                district: { $exists: true, $ne: null }
            }
        },
        {
            $group: {
                _id: "$district",
                userCount: { $sum: 1 },
                totalStreak: { $sum: "$streak" },
                avgStreak: { $avg: "$streak" },
                maxStreak: { $max: "$streak" },
                users: {
                    $push: {
                        username: "$username",
                        avatar: "$avatar",
                        streak: "$streak",
                        lastLoginDate: "$lastLoginDate"
                    }
                }
            }
        },
        {
            $project: {
                name: "$_id",
                userCount: 1,
                totalPoints: { $multiply: ["$totalStreak", 15] }, // Calculate total points
                avgPoints: { $multiply: ["$avgStreak", 15] },
                maxStreak: 1,
                topUsers: {
                    $slice: [
                        {
                            $sortArray: {
                                input: "$users",
                                sortBy: { streak: -1 }
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
            points: user.streak * 15,
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
        .select('username fullName avatar streak gender district state lastLoginDate')
        .lean();

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Calculate user's global rank
    const usersAhead = await User.countDocuments({
        streak: { $gt: user.streak }
    });

    // Calculate user's district rank if district exists
    let districtRank = null;
    if (user.district) {
        const usersAheadInDistrict = await User.countDocuments({
            district: user.district,
            streak: { $gt: user.streak }
        });
        districtRank = usersAheadInDistrict + 1;
    }

    // Get user above and below for motivation
    const userAbove = await User.findOne({
        streak: { $gt: user.streak }
    })
    .select('username streak')
    .sort({ streak: 1 })
    .lean();

    const userBelow = await User.findOne({
        streak: { $lt: user.streak }
    })
    .select('username streak')
    .sort({ streak: -1 })
    .lean();

    const userPosition = {
        ...user,
        globalRank: usersAhead + 1,
        districtRank,
        points: user.streak * 15,
        lastActive: user.lastLoginDate ? getTimeAgo(user.lastLoginDate) : 'now',
        userAbove,
        userBelow,
        pointsToNextRank: userAbove ? (userAbove.streak - user.streak) * 15 : 0
    };

    return res.status(200).json(
        new ApiResponse(200, userPosition, "User position fetched successfully")
    );
});

// Get top performers (top 10)
const getTopPerformers = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const topUsers = await User.find({})
        .select('username fullName avatar streak gender district state lastLoginDate maxStreak')
        .sort({ streak: -1 })
        .limit(parseInt(limit))
        .lean();

    const enhancedUsers = topUsers.map((user, index) => ({
        ...user,
        rank: index + 1,
        points: user.streak * 15,
        lastActive: user.lastLoginDate ? getTimeAgo(user.lastLoginDate) : 'Unknown',
        badges: generateBadges(user)
    }));

    return res.status(200).json(
        new ApiResponse(200, enhancedUsers, "Top performers fetched successfully")
    );
});

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
    
    if (user.streak >= 30) {
        badges.push({ type: 'fire', name: 'Fire Streak', color: 'orange' });
    }
    if (user.streak * 15 >= 1000) {
        badges.push({ type: 'star', name: 'High Achiever', color: 'yellow' });
    }
    if (user.streak >= 7) {
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