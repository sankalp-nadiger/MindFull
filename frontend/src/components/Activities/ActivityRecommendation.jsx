import React, { useState } from 'react';
import { Clock, RotateCcw, ChevronDown, ChevronUp,ArrowLeft } from 'lucide-react';
import { Link } from "react-router-dom";
const ActivityCard = ({
    image,
    title,
    description,
    frequency,
    time,
    imageAlt = "Activity image"
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="group bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-800 hover:border-gray-600 w-full max-w-xs mx-auto">
            
            <div className="relative overflow-hidden h-48">
                <img
                    src={image}
                    alt={imageAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            
            <div className="p-5 space-y-4">
                {/* Title */}
                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                    {title}
                </h3>

                
                <div className="space-y-2">
                    <p className={`text-gray-300 text-sm leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'
                        }`}>
                        {description}
                    </p>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
                    >
                        {isExpanded ? (
                            <>
                                Show less <ChevronUp size={14} />
                            </>
                        ) : (
                            <>
                                Read more <ChevronDown size={14} />
                            </>
                        )}
                    </button>
                </div>

                
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                    <div className="flex items-center space-x-2 text-gray-400">
                        <RotateCcw size={16} className="group-hover:text-blue-400 transition-colors duration-300" />
                        <span className="text-sm font-medium">{frequency}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-400">
                        <Clock size={16} className="group-hover:text-blue-400 transition-colors duration-300" />
                        <span className="text-sm font-medium">{time}</span>
                    </div>
                </div>
            </div>

          
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    );
};


const ActivityCardDemo = () => {
    const activities = [
        {
            image: "https://plus.unsplash.com/premium_photo-1672037884220-3c42b63de4f6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGRlZXAlMjBicmVhdGhpbmd8ZW58MHx8MHx8fDA%3D",
            title: "Deep Breathing Exercise",
            description: `A technique to slow down breathing, calm the nervous system, and reduce anxiety.
Step-by-Step:

Find a quiet, comfortable place to sit or lie down.

Loosen any tight clothing and relax shoulders.

Place one hand on your chest and the other on your belly.

Inhale slowly through your nose for 4 seconds, feeling your belly rise more than your chest.

Hold your breath for 4 seconds.

Exhale gently through your mouth for 4 seconds, feeling your belly fall.

Pause for 4 seconds, then repeat for 5–10 minutes.`,
            frequency: "2–3 times daily",
            time: "Morning"
        },
        {
            image: "https://plus.unsplash.com/premium_photo-1664382465665-fb103c7c6665?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8am91cm5hbGxpbmd8ZW58MHx8MHx8fDA%3D",
            title: "Gratitude Journaling",
            description: `Writing down things you’re thankful for to focus on positives and build resilience.
Step-by-Step:

Choose a journal (paper or app).

Set aside a specific time, like after waking or before sleeping.

List 3–5 specific things you are grateful for today; be detailed (e.g., “the sunshine in the morning”).

Reflect on why each item matters.

If feeling low, revisit past entries for emotional encouragement.`,
            frequency: "Daily.",
            time: "Evening before bed."
        },
        {
            image: "https://images.unsplash.com/photo-1604769688135-f245c9f9a486?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHdhbGt8ZW58MHx8MHx8fDA%3D",
            title: "Mindful Walking",
            description: `Walking slowly and focusing awareness on movement and surroundings.
Step-by-Step:

Stand still, take a deep breath, and center your attention.

Begin walking slowly; focus on lifting, moving, and placing each foot.

Notice sensations in your feet and legs.

Stay aware of surroundings, sights, and sounds.

If thoughts wander, gently return focus to walking sensations.

Practice for 10–15 minutes.`,
            frequency: "Once daily.",
            time: "Morning"
        },
        {
            image: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGRpZ2l0YWwlMjBkZXRveHxlbnwwfHwwfHx8MA%3D%3D",
            title: "Digital Detox",
            description: `Take a break from screens to lower stress and avoid negative digital triggers.
Step-by-Step:

Schedule 30–60 minutes of “device-free” time.

Turn off notifications or place devices out of sight.

Use this time to relax, read, take a walk, or connect with others offline.

Reflect afterwards on your mood and focus.`,
            frequency: "30–60 min daily",
            time: "At night before sleep."
        },
        {
            image: "https://images.unsplash.com/photo-1540206255313-0a128e05d1c5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fG11c2NsZSUyMHJlbGF4YXRpb258ZW58MHx8MHx8fDA%3D",
            title: "Progressive Muscle Relaxation",
            description: `Alternately tensing and relaxing muscle groups to reduce tension.
Step-by-Step:

Find a quiet place to sit or lie down.

Starting at your toes, tense muscles for 5 seconds (e.g., curl your toes).

Release, noticing the warmth and relaxation as tension leaves.

Progress to each muscle group (calves, thighs, abdomen, hands, arms, shoulders, face).

End with a full-body stretch.`,
            frequency: "3–4 times weekly.",
            time: "Evening"
        },
        {
            image: "https://images.unsplash.com/photo-1602677416440-51e91ddeef89?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YWZmaXJtYXRpb25zfGVufDB8fDB8fHww",
            title: "Positive Affirmations",
            description: `Repeating reassuring statements to counter negative thinking.
Step-by-Step:

Choose 2–3 positive affirmations (e.g., “I am resilient,” “This feeling will pass”).

Stand tall in front of a mirror if possible.

Repeat each affirmation slowly and with intention, 3–5 times.

Focus on the feeling behind the words.`,
            frequency: "Twice daily.",
            time: "Morning upon waking"
        },
        {
            image: "https://plus.unsplash.com/premium_photo-1673514503538-f6091d26e482?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZHJhd3xlbnwwfHwwfHx8MA%3D%3D",
            title: "Creative Expression",
            description: `Channel emotions through art, music, or writing.
Step-by-Step:

Set aside 20–30 minutes for a creative activity (drawing, painting, playing an instrument, or writing).

Focus on the process rather than the result.

If stuck, draw or write about current feelings.

Allow emotions to flow freely onto the page or medium.`,
            frequency: "2–3 times weekly.",
            time: "Afternoon "
        },
        {
            image: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXhlcmNpc2V8ZW58MHx8MHx8fDA%3D",
            title: "Physical Exercise",
            description: `Movement lifts mood and relieves physical symptoms of stress.
Step-by-Step:

Choose an activity you enjoy (walking, yoga, stretching, dancing).

Warm up with slow stretches.

Engage in moderate activity for 20–30 minutes.

Cool down and note any changes in mood or tension.`,
            frequency: "4–5 times weekly.",
            time: "Morning "
        },
        {
            image: "https://images.unsplash.com/photo-1559595500-e15296bdbb48?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1lZGl0YXRpb258ZW58MHx8MHx8fDA%3D",
            title: "Guided Meditation",
            description: `Using audio or apps to meditate and focus the mind.
Step-by-Step:

Find a quiet, comfortable spot.

Use an app or audio guide (many available for free).

Close your eyes and follow the guide, focusing on breathing, sounds, or visualizations.

Start with 5 minutes; gradually increase with confidence.`,
            frequency: "Daily.",
            time: "Morning "
        },
        {
            image: "https://images.unsplash.com/photo-1648250537652-a648421c588c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c29jaWFsaXplfGVufDB8fDB8fHww",
            title: "Social Connection",
            description: `Talking, sharing, and connecting with supportive others.
Step-by-Step:

Identify someone you trust (friend, family, or group).

Reach out with a call, message, or plan a meet-up.

Share feelings and listen non-judgmentally.

If in person, focus on face-to-face interaction, avoiding distractions.`,
            frequency: "2–3 times weekly.",
            time: "Evenings or weekends when relaxed."
        }
    ];


    return (
        <>
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
                          to="/MainPage"
                          className="flex items-center justify-center gap-1 sm:gap-2 text-gray-900 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5" />
                          <span className="hidden sm:block text-sm font-medium sm:text-base">Back to Dashboard</span>
                        </Link>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Activity Sugesstions
              </h1>
              <p className="text-sm text-slate-400">Discover new activities to enhance your daily routine</p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              
              <span className="text-slate-400"></span>
            </div>
          </div>
        </div>
      </header>
        <div className="min-h-screen bg-gray-950 py-8 px-4">
            
            <div className="max-w-7xl mx-auto">
               

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {activities.map((activity, index) => (
                        <ActivityCard
                            key={index}
                            image={activity.image}
                            title={activity.title}
                            description={activity.description}
                            frequency={activity.frequency}
                            time={activity.time}
                            imageAlt={activity.title}
                        />
                    ))}
                </div>
            </div>
            
        </div>
        </>
    );
};

export default ActivityCardDemo;