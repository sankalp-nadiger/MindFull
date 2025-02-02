import React, { useState } from 'react';
import Footer from '../Footer/Footer';
const SuccessStories = () => {
  const stories = [
    {
      title: "Transforming My Mental Well-Being: How MindFull Helped Me Find Balance",
      content: `Before MindFull, I struggled with managing stress and anxiety during my college exams. The constant pressure to succeed often left me overwhelmed, and I felt like I was drowning. I tried numerous methods to manage my mental health, but nothing seemed to stick. That was until I discovered MindFull. Through its guided mindfulness exercises, I began to find peace amidst the chaos. The platform's simple yet effective approach to stress management helped me regain control of my emotions and thoughts. Now, I’m able to approach challenges with a clearer mind, a sense of calm, and better resilience. MindFull didn’t just help me manage stress—it helped me transform my mental well-being.`,
      author: "Alex G",
      location: "MYSURU",
      image: "65.png",
    },
    {
      title: "A Journey of Inner Peace: Overcoming Anxiety with MindFull",
      content: `Dealing with anxiety has always been a part of my life, and as I entered my final year of high school, I felt like I was at my breaking point. The pressure of exams, coupled with the uncertainties of the future, weighed heavily on me. My anxiety had reached a level where it felt almost impossible to focus or relax. That’s when a friend introduced me to MindFull, and everything changed. MindFull's techniques helped me face my fears and anxieties head-on. The breathing exercises, meditation sessions, and calming sounds became a part of my daily routine. With time, I started feeling more grounded, less anxious, and more confident in my ability to tackle life's challenges. My journey to inner peace with MindFull has been transformative, and I am forever grateful for this life-changing experience.`,
      author: "Sonia M",
      location: "BANGALORE",
      image: "18.png",
    },
    {
      title: "Finding Strength in Vulnerability: My Story of Overcoming Depression with MindFull",
      content: `Depression had been my constant companion for years. I felt trapped in a cycle of sadness, hopelessness, and self-doubt. No matter how hard I tried, nothing seemed to break the chains of my mental health struggles. My turning point came when I discovered MindFull. The platform encouraged me to embrace my vulnerabilities, to not shy away from my emotions but to process and understand them. Through guided journaling, meditation, and mindfulness exercises, I slowly began to rebuild myself from the inside out. I learned to acknowledge my feelings without judgment and to treat myself with the compassion I had long denied myself. Over time, my depression didn’t feel as heavy, and I found strength in my vulnerability. MindFull helped me regain my sense of self-worth and reconnected me with the joy of living.`,
      author: "Rahul Deshmukh",
      location: "PUNE",
      image: "55.png",
    },
    {
      title: "Reclaiming My Confidence: How MindFull Helped Me Overcome Self-Doubt",
      content: `For as long as I could remember, self-doubt had held me back from reaching my full potential. Whether it was in academics, sports, or personal relationships, I constantly questioned my abilities and feared failure. This cycle of negative thinking limited my growth. After discovering MindFull, I started practicing self-affirmation techniques and engaging in daily mindfulness activities. Slowly, I began to change the way I saw myself. The more I focused on positive thoughts and actions, the more confident I became. MindFull helped me realize that my self-worth isn't defined by past mistakes or others' opinions. Now, I face challenges with confidence and belief in my abilities, and the fear of failure no longer holds me back.`,
      author: "Priya Sharma",
      location: "DELHI",
      image: "41.png",
    },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStories, setFilteredStories] = useState(stories);

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = stories.filter((story) =>
      story.author.toLowerCase().includes(query)
    );
    setFilteredStories(filtered);
  };

  return (
    <div>
    <section className="min-h-screen bg-gradient-to-b from-black via-purple-800 to-black text-white p-6 font-sans">
      <div className="container  mx-auto">
        <h1 className="text-4xl font-semibold text-center mb-16">Success Stories</h1>

        {/* Search Box */}
        <div className="mb-12 flex justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by Author Name"
            className="px-4 py-2 text-black rounded-md w-1/2 md:w-1/3 focus:outline-none"
          />
        </div>

        <div className="flex-col   flex-wrap -m-12">
          {filteredStories.map((story, index) => (
            <div key={index} className="p-12 md:w-[100%] lg:w-[100%] flex flex-col items-start text-white">
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <span className="inline-block py-1 px-2 rounded bg-indigo-50 text-black text-xs font-medium tracking-widest">STORIES</span>
                <h2 className="text-2xl font-medium text-white mt-4 mb-4">{story.title}</h2>
                <p className="text-gray-300 leading-relaxed mb-8">{story.content}</p>
                <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">
                  
    
                </div>
                <div className="flex items-center mt-6">
                  <img alt="blog" src={story.image} className="w-12 h-12 rounded-full flex-shrink-0 object-cover object-center" />
                  <span className="flex-grow flex flex-col pl-4">
                    <span className="font-medium text-white">{story.author}</span>
                    <span className="text-gray-400 text-xs tracking-widest mt-0.5">{story.location}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
     
    </section>
     <Footer/>
    </div>
  );
};

export default SuccessStories;
