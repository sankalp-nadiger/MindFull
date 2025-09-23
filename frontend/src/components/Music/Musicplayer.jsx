import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, X, Smile, Frown, Moon, Zap, Heart } from 'lucide-react';
import ReactPlayer from 'react-player';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Aurora from './Aurora';
  

const moods = [
  { id: 'happy', name: 'Happy', icon: <Smile className="h-5 w-5" /> },
  { id: 'sad', name: 'Sad', icon: <Frown className="h-5 w-5" /> },
  { id: 'sleepy', name: 'Sleepy', icon: <Moon className="h-5 w-5" /> },
  { id: 'energetic', name: 'Energetic', icon: <Zap className="h-5 w-5" /> },
  { id: 'Nostalgia', name: 'Nostalgia', icon: <Heart className="h-5 w-5" /> }
];

const songs = [
    { id: '1', title: "Can't Stop the Feeling! ", artist: 'Justin Timberlake', coverUrl: 'feeling.jpeg', mood: 'happy', audioUrl: 'https://www.youtube.com/watch?v=ru0K8uYEZWw' },
    { id: '2', title: 'Happy', artist: 'Pharrell Williams', coverUrl: 'happy.jpeg', mood: 'happy', audioUrl: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs' },
    { id: '3', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', coverUrl: 'uptown.jpeg', mood: 'happy', audioUrl: 'https://www.youtube.com/watch?v=OPf0YbXqDm0' },
    { id: '4', title: 'Someone Like You', artist: 'Adele', coverUrl: 'adele.jpeg', mood: 'sad', audioUrl: 'https://www.youtube.com/watch?v=hLQl3WQQoQ0' },
    { id: '5', title: 'The Night we Met', artist: 'Lord Huron', coverUrl: 'night.jpeg', mood: 'sad', audioUrl: 'https://www.youtube.com/watch?v=KtlgYxa6BMU' },
    { id: '7', title: 'Weightless', artist: 'Marconi Union', coverUrl: 'weight.jpeg', mood: 'sleepy', audioUrl: 'https://www.youtube.com/watch?v=LlJwjeuBlYE' },
    { id: '8', title: 'Clair de Lune', artist: 'Claude Debussy', coverUrl: 'clair.jpeg', mood: 'sleepy', audioUrl: 'https://www.youtube.com/watch?v=WNcsUNKlAKw' },
    { id: '10', title: 'Lose Yourself ', artist: ' Eminem', coverUrl: 'eminem.jpeg', mood: 'energetic', audioUrl: 'https://www.youtube.com/watch?v=xFYQQPAOz7Y' },
    { id: '11', title: 'Stronger ', artist: 'Kanye West', coverUrl: 'strong.jpeg', mood: 'energetic', audioUrl: 'https://www.youtube.com/watch?v=PsO6ZnUZI0g' },
    { id: '13', title: 'Memories', artist: 'Maroon 5', coverUrl: 'memories.jpeg', mood: 'Nostalgia', audioUrl: 'https://www.youtube.com/watch?v=SlPhMPnQ58k' },
];

const podcasts = [
  { id: '1', title: 'The Mental Health Doctor: Your Phone Screen & Sitting Is Destroying Your Brain!', url: 'https://www.youtube.com/watch?v=FN0_ow76hU8' },
  { id: '2', title: 'Mindfulness for Beginners', url: 'https://www.youtube.com/watch?v=8rp5bpFIUpg' },
  { id: '3', title: 'How to Deal with Anxiety', url: 'https://www.youtube.com/watch?v=WWloIAQpMcQ' },
  { id: '4', title: "The Holistic Doctor's 3-STEP HACK For Optimal Physical & Mental Health!", url: 'https://www.youtube.com/watch?v=6z0Ker1Z3-0' },
  { id: '5', title: 'Meditation for Stress Relief', url: 'https://www.youtube.com/watch?v=inpok4MKVLM' },
  { id: '6', title: 'Coming Soon .....'}
];

export default function MusicPlayerApp() {
  const [selectedMood, setSelectedMood] = useState(moods[0].id);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const nextSong = () => {
    if (currentSong) {
      const currentIndex = filteredSongs.findIndex(song => song.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % filteredSongs.length;
      setCurrentSong(filteredSongs[nextIndex]);
    }
  };

  const handleSongSelect = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current.play();
    }, 100);
  };

  const filteredSongs = songs.filter(song => song.mood === selectedMood);

  return (
    <div className="overflow-x-hidden">
      <Navbar/>
    
<div className={`flex flex-col items-center justify-center bg-black font-poppins  text-white  ${currentSong ? 'blur-sm' : ''}`}>
  <Aurora
  colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
  blend={0.5}
  amplitude={1.0}
  speed={0.5}
></Aurora>
  <div className="w-full max-w-4xl px-6">
    <h1 className="text-5xl font-bold mb-6 text-center">Mood-Based Music Player</h1>
    <p className="text-lg sm:text-xl md:text-2xl py-2 font-mono text-gray-800 dark:text-gray-300 leading-relaxed tracking-wide text-center">
      How are you feeling TODAY ? We have carefully curated these songs according to your mood.
    </p>
    
    <div className="flex flex-wrap gap-3 mb-6 justify-center">
      {moods.map(mood => (
        <button 
          key={mood.id} 
          onClick={() => setSelectedMood(mood.id)} 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${selectedMood === mood.id ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          {mood.icon} {mood.name}
        </button>
      ))}
    </div>
    
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {filteredSongs.length > 0 ? filteredSongs.map(song => (
        <button 
          key={song.id} 
          onClick={() => handleSongSelect(song)} 
          className="flex items-center gap-3 w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-300"
        >
          <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded-lg" />
          <div className="text-left">
            <h3 className="text-lg font-semibold">{song.title}</h3>
            <p className="text-sm text-gray-400">{song.artist}</p>
          </div>
        </button>
      )) : <p className="text-center">No songs available for this mood.</p>}
    </div>
  </div>
</div>


{currentSong && (
  <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black bg-opacity-75 backdrop-blur-sm">
    
    <div className="w-full h-full max-w-4xl max-h-screen bg-black/40 z-50 border-2 border-white rounded-none sm:rounded-2xl sm:max-w-2xl sm:max-h-[90vh] p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      
      
      <button 
        onClick={() => setCurrentSong(null)} 
        className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-300"
      >
        <X className="h-6 w-6" />
      </button>
      
      
      <div className="mb-6 sm:mb-8">
        <img 
          src={currentSong.coverUrl} 
          alt={currentSong.title} 
          className={`w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full shadow-2xl ${isPlaying ? 'animate-spin-slow' : ''}`}
        />
      </div>
      
      
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{currentSong.title}</h3>
        <p className="text-lg sm:text-xl text-gray-300">{currentSong.artist}</p>
      </div>
      
      
      <ReactPlayer 
        url={currentSong.audioUrl} 
        playing={isPlaying} 
        controls={false}
        width="0px" 
        height="0px" 
        config={{ youtube: { playerVars: { modestbranding: 1, showinfo: 0 } } }} 
      />
      
     
      <div className="flex gap-4 sm:gap-6">
        <button 
          onClick={() => setIsPlaying(!isPlaying)} 
          className="p-4 sm:p-5 bg-purple-600 hover:bg-purple-700 rounded-full transition-all duration-300 shadow-lg"
        >
          {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
        </button>
        <button 
          onClick={nextSong} 
          className="p-4 sm:p-5 bg-gray-900 hover:bg-gray-800 rounded-full transition-all duration-300 shadow-lg"
        >
          <SkipForward className="h-8 w-8" />
        </button>
      </div>
    </div>
  </div>
)}


<style jsx>{`
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 10s linear infinite;
  }
`}</style>
      
      {/* Mental Health Podcasts Section with Grid Background */}
      <div className="w-full pt-10 px-10 relative font-poppins">
        {/* Edge blur masks - top, left, right, bottom */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black via-black/60 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-black via-black/60 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-black via-black/60 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-black via-black/60 to-transparent z-10 pointer-events-none"></div>

        {/* Overall subtle overlay to reduce line brightness */}
        <div className="absolute inset-0 bg-black/20 z-5 pointer-events-none"></div>
        
        <div className="w-full p-8 text-white shadow-lg" style={{
          '--color': 'rgba(114, 114, 114, 0.25)',
          backgroundColor: '#000000',
          backgroundImage: `
            linear-gradient(0deg,
              transparent 24%,
              var(--color) 25%,
              var(--color) 26%,
              transparent 27%,
              transparent 74%,
              var(--color) 75%,
              var(--color) 76%,
              transparent 77%,
              transparent
            ),
            linear-gradient(90deg,
              transparent 24%,
              var(--color) 25%,
              var(--color) 26%,
              transparent 27%,
              transparent 74%,
              var(--color) 75%,
              var(--color) 76%,
              transparent 77%,
              transparent
            )
          `,
          backgroundSize: '55px 55px',
        }}>
          <div className="relative z-10">
            <h2 className="text-5xl font-extrabold mb-6 text-center border-b-2 border-purple-500 pb-2">🌿 Mental Health Podcasts</h2>
            <p className="text-white text-lg mb-6 text-center">
              Discover insightful discussions on mindfulness, stress relief, and positivity. Tune in and find your inner peace.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {podcasts.map(podcast => (
                <div key={podcast.id} className="bg-gray-800/80 backdrop-blur-sm p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-600">
                  <h3 className="text-xl font-semibold mb-3 text-white">{podcast.title}</h3>
                  {podcast.url ? (
                    <ReactPlayer url={podcast.url} width="100%" height="220px" controls className="rounded-lg overflow-hidden" />
                  ) : (
                    <div className="w-full h-[220px] bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">More Coming Soon...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer/>
    </div>
  );
}