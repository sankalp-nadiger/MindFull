import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import Navbar from '../Navbar/Navbar';
import { ArrowLeft, Send, Bot, User, Heart, Brain, Zap, Shield, MessageCircle, Sparkles, Star, Moon, Sun, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'highlight.js/styles/github-dark.css';
import '../../styles/markdown.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "# Hello! I'm Soulynk Bot 🌟\n\nI'm your compassionate mental health companion, here to provide support, guidance, and evidence-based information about mental wellness.\n\n## I can help you with:\n\n• **Stress management** techniques\n• **Mindfulness** and meditation practices\n• **Coping strategies** for anxiety and depression\n• Building **healthy habits**\n• **Self-care** routines\n• **Sleep hygiene**\n• **Emotional regulation**\n• Building **resilience**\n\nHow can I support your mental wellness journey today? 💙",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  const SYSTEM_PROMPT = `You are MindFull Bot, a compassionate and knowledgeable mental health assistant specifically designed to support mental wellness and emotional wellbeing.

Your primary role is to:
1. Provide evidence-based mental health information and support
2. Offer practical coping strategies and techniques
3. Guide users through mindfulness and relaxation exercises
4. Help with stress management and emotional regulation
5. Suggest healthy lifestyle habits that support mental wellness
6. Provide crisis support information when needed
7. Encourage professional help when appropriate

You should:
- Be empathetic, warm, and supportive in your responses
- Use a conversational, friendly tone while maintaining professionalism
- Provide practical, actionable advice
- Include mindfulness techniques, breathing exercises, and grounding techniques
- Suggest creative activities, journaling prompts, and self-care practices
- Validate the user's feelings and experiences
- Break down complex topics into manageable steps
- Use emojis appropriately to convey warmth and support

For crisis situations, always provide:
- Immediate coping strategies
- Professional helpline numbers
- Encouragement to seek immediate professional help

IMPORTANT: Always include appropriate disclaimers that you're not a replacement for professional mental health care, and encourage users to seek professional help for serious concerns.

Respond in a caring, supportive manner that promotes healing and growth.`;
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { 
      role: "user", 
      content: userMessage,
      timestamp: new Date()
    }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);    try {
      // Prepare the message with context for better responses
      const contextualMessage = `${SYSTEM_PROMPT}\n\nUser message: ${userMessage}`;
      
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/chat`, {
        message: contextualMessage
      });

      const botResponse = response.data.botResponse;
      
      if (botResponse) {
        setMessages([...newMessages, { 
          role: "assistant", 
          content: botResponse,
          timestamp: new Date()
        }]);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details ||
                          "I apologize, but I'm having trouble processing your question right now. Please try again in a moment. 💙";

      setMessages([...newMessages, { 
        role: "assistant", 
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K to clear chat
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        clearChat();
      }
      // Escape to focus input
      if (e.key === 'Escape') {
        const inputElement = document.querySelector('textarea[placeholder*="Share what\'s on your mind"]');
        if (inputElement) {
          inputElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const quickPrompts = [
    { icon: "🧘", text: "Help me with stress relief", prompt: "I'm feeling stressed and overwhelmed. Can you guide me through some stress relief techniques?" },
    { icon: "😰", text: "Managing anxiety", prompt: "I'm experiencing anxiety. What are some practical ways to manage it?" },
    { icon: "💤", text: "Better sleep habits", prompt: "I'm having trouble sleeping. Can you help me develop better sleep habits?" },
    { icon: "🌱", text: "Building resilience", prompt: "How can I build mental resilience and emotional strength?" },
    { icon: "❤️", text: "Self-care tips", prompt: "What are some effective self-care practices for mental wellness?" },
    { icon: "🎯", text: "Mindfulness exercises", prompt: "Can you teach me some mindfulness exercises I can do daily?" }
  ];

  const mindfulnessExercises = [
    {
      title: "Deep Breathing Exercise",
      description: "A simple 4-7-8 breathing technique",
      steps: [
        "Sit comfortably and close your eyes",
        "Inhale through your nose for 4 counts",
        "Hold your breath for 7 counts", 
        "Exhale through your mouth for 8 counts",
        "Repeat 3-4 times"
      ]
    },
    {
      title: "5-4-3-2-1 Grounding",
      description: "Use your senses to stay present",
      steps: [
        "Name 5 things you can see",
        "Name 4 things you can touch",
        "Name 3 things you can hear",
        "Name 2 things you can smell",
        "Name 1 thing you can taste"
      ]
    },
    {
      title: "Body Scan Meditation",
      description: "Release tension throughout your body",
      steps: [
        "Lie down or sit comfortably",
        "Start from the top of your head",
        "Slowly move attention down your body",
        "Notice any tension without judgment",
        "Breathe into tense areas and release"
      ]
    }
  ];
  const handleQuickExercise = (exercise) => {
    const exerciseMessage = `Here's a guided ${exercise.title}:\n\n${exercise.description}\n\nSteps:\n${exercise.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\nTake your time with each step. Remember, there's no right or wrong way to do this. Just be gentle with yourself. 💙\n\nWould you like to try this exercise now, or would you prefer a different technique?`;
    
    setMessages(prev => [...prev, {
      role: "assistant",
      content: exerciseMessage,
      timestamp: new Date()
    }]);
  };
  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "# Hello! I'm Soulynk Bot 🌟\n\nI'm your compassionate mental health companion, here to provide support, guidance, and evidence-based information about mental wellness.\n\n## I can help you with:\n\n• **Stress management** techniques\n• **Mindfulness** and meditation practices\n• **Coping strategies** for anxiety and depression\n• Building **healthy habits**\n• **Self-care** routines\n• **Sleep hygiene**\n• **Emotional regulation**\n• Building **resilience**\n\nHow can I support your mental wellness journey today? 💙",
      timestamp: new Date()
    }]);
  };

  const copyToClipboard = async (text, messageIndex) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageIndex);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  const themeClasses = {
    bg: darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    cardBg: darkMode ? 'bg-slate-800/90 border-slate-700 backdrop-blur-xl' : 'bg-white/90 border-gray-200 backdrop-blur-xl',
    text: darkMode ? 'text-slate-100' : 'text-gray-800',
    textSecondary: darkMode ? 'text-slate-300' : 'text-gray-600',
    userBubble: darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-indigo-500',
    botBubble: darkMode ? 'bg-slate-700/90 border border-slate-600' : 'bg-white border border-gray-200',
    input: darkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-gray-300 text-gray-800',
    button: darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
  };
  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-all duration-300`}> 
      
      {/* Enhanced Header */}
      <div className="sticky top-0 z-10 border-b backdrop-blur-xl border-white/10">
        <div className="max-w-6xl px-2 py-3 mx-auto sm:px-4 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Back button */}
            <div className="flex items-center flex-1">
              <Link 
  to="/MainPage" 
  className={`flex items-center gap-1 sm:gap-2 ${themeClasses.text} hover:text-blue-400 transition-all duration-200 hover:scale-105`}
>
  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
  <span className="hidden sm:block text-sm text-gray-400 font-medium sm:text-base">Back to Dashboard</span>
</Link>
            </div>
            
            {/* Center - Branding */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center justify-center shadow-lg w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                <Bot className="w-5 h-5 text-white sm:w-7 sm:h-7" />
              </div>
              <div className="text-center">
                <h1 className={`text-lg sm:text-3xl font-bold ${themeClasses.text} bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}>
                  Soulynk Bot
                </h1>
                <p className={`text-xs sm:text-sm ${themeClasses.textSecondary} hidden sm:block`}>Your compassionate AI mental health companion</p>
              </div>
            </div>
            
            {/* Right side - Status and controls */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
              <div className="items-center hidden gap-2 sm:flex">
                <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg animate-pulse shadow-green-400/50"></div>
                <span className={`text-sm ${themeClasses.textSecondary}`}>Online</span>
              </div>
              
              {messages.length > 1 && (
                <button
                  onClick={clearChat}
                  className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm ${themeClasses.cardBg} hover:bg-red-500/10 rounded-xl transition-all border text-red-400 hover:text-red-500 hover:scale-105`}
                >
                  Clear
                </button>
              )}
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 sm:p-3 rounded-xl ${themeClasses.cardBg} transition-all hover:scale-105`}
              >
                {darkMode ? <Sun className="w-4 h-4 text-yellow-400 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 text-blue-600 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Chat Container with top padding */}
      <div className="max-w-6xl px-2 py-4 mx-auto sm:px-4 sm:py-8 pt-6 sm:pt-8">
        <div className={`${themeClasses.cardBg} rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border`}>
          
          {/* Messages Area */}
          <div className="h-[60vh] sm:h-[65vh] overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6" style={{ scrollbarWidth: 'thin' }}>
            {messages.length === 0 && (
              <div className="py-8 text-center sm:py-16">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full shadow-lg sm:w-24 sm:h-24 sm:mb-6 bg-gradient-to-r from-blue-500 to-purple-500">
                  <Heart className="w-8 h-8 text-white sm:w-12 sm:h-12" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${themeClasses.text} mb-2 sm:mb-3`}>Welcome to Soulynk Bot</h3>
                <p className={`${themeClasses.textSecondary} mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base px-4`}>
                  I'm here to support your mental wellness journey with compassionate guidance and evidence-based techniques.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6`}>
                <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 sm:gap-4 max-w-[90%] sm:max-w-[85%]`}>
                  {/* Enhanced Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}>
                    {msg.role === 'user' ? 
                      <User className="w-4 h-4 text-white sm:w-5 sm:h-5" /> : 
                      <Bot className="w-4 h-4 text-white sm:w-5 sm:h-5" />
                    }
                  </div>
                  
                  {/* Enhanced Message Bubble */}
                  <div className={`relative group ${
                    msg.role === 'user' 
                      ? `${themeClasses.userBubble} text-white` 
                      : `${themeClasses.botBubble} ${themeClasses.text}`
                  } shadow-xl rounded-2xl overflow-hidden`}>
                    <div className="px-3 py-3 sm:px-5 sm:py-4">
                      {msg.role === 'assistant' ? (                        <div className={`prose prose-sm max-w-none markdown-content ${darkMode ? 'dark' : 'light'}`}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              h1: ({node, ...props}) => <h1 className="mb-2 text-lg font-bold text-blue-400 sm:mb-3 sm:text-xl" {...props} />,
                              h2: ({node, ...props}) => <h2 className="mb-2 font-semibold text-purple-400 text-md sm:text-lg" {...props} />,
                              h3: ({node, ...props}) => <h3 className="mb-2 font-medium text-sm sm:text-md" {...props} />,
                              p: ({node, ...props}) => <p className="mb-2 leading-relaxed sm:mb-3 text-sm sm:text-base" {...props} />,
                              ul: ({node, ...props}) => <ul className="mb-2 ml-3 space-y-1 list-disc sm:mb-3 sm:ml-4 text-sm sm:text-base" {...props} />,
                              ol: ({node, ...props}) => <ol className="mb-2 ml-3 space-y-1 list-decimal sm:mb-3 sm:ml-4 text-sm sm:text-base" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold text-blue-300" {...props} />,
                              em: ({node, ...props}) => <em className="italic" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="pl-3 my-2 italic border-l-4 border-purple-400 sm:pl-4 sm:my-3" {...props} />,
                              a: ({node, ...props}) => <a className="text-blue-400 underline hover:text-blue-300" target="_blank" rel="noopener noreferrer" {...props} />,
                              code: ({node, inline, ...props}) => 
                                inline ? 
                                  <code className="bg-slate-600/50 px-1 py-0.5 rounded text-xs sm:text-sm" {...props} /> :
                                  <code className="block p-2 overflow-x-auto text-xs rounded-lg sm:p-3 sm:text-sm bg-slate-700" {...props} />,
                              pre: ({node, ...props}) => <pre className="p-2 mb-2 overflow-x-auto text-xs rounded-lg sm:p-3 sm:mb-3 sm:text-sm bg-slate-700" {...props} />
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap sm:text-base">
                          {msg.content}
                        </div>
                      )}
                    </div>
                    
                    {/* Message Actions */}
                    <div className="flex items-center justify-between px-3 pb-2 sm:px-5 sm:pb-3">
                      <div className={`text-xs opacity-70 ${
                        msg.role === 'user' ? 'text-blue-100' : themeClasses.textSecondary
                      }`}>
                        {formatTime(msg.timestamp)}
                      </div>
                      
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1 transition-opacity opacity-0 sm:gap-2 group-hover:opacity-100">
                          <button
                            onClick={() => copyToClipboard(msg.content, index)}
                            className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
                              darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-100'
                            }`}
                            title="Copy message"
                          >
                            {copiedMessageId === index ? 
                              <Check className="w-3 h-3 text-green-500 sm:w-4 sm:h-4" /> : 
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                            }
                          </button>
                          <button
                            className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
                              darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-100'
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
                              darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-100'
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}            {loading && (
              <div className="flex justify-start mb-4 sm:mb-6">
                <div className="flex items-start gap-2 sm:gap-4 max-w-[90%] sm:max-w-[85%]">
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full shadow-lg sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500">
                    <Bot className="w-4 h-4 text-white sm:w-5 sm:h-5" />
                  </div>
                  <div className={`${themeClasses.botBubble} px-3 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-xl`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>SoulynkBot is thinking</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>          {/* Enhanced Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-3 py-4 border-t sm:px-6 sm:py-6 border-gray-200/10">
              <h4 className={`text-base sm:text-lg font-semibold ${themeClasses.text} mb-3 sm:mb-4 flex items-center gap-2`}>
                <Sparkles className="w-4 h-4 text-purple-400 sm:w-5 sm:h-5" />
                Quick Start Conversations
              </h4>
              <div className="grid grid-cols-1 gap-2 mb-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3 sm:mb-6">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt.prompt)}
                    className={`p-3 sm:p-4 text-left ${themeClasses.cardBg} hover:bg-blue-500/10 rounded-xl transition-all border group hover:scale-105 hover:shadow-lg`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xl transition-transform sm:text-2xl group-hover:scale-110">{prompt.icon}</span>
                      <div>
                        <div className={`${themeClasses.text} font-medium mb-1 text-sm sm:text-base`}>{prompt.text}</div>
                        <div className={`text-xs ${themeClasses.textSecondary} opacity-75`}>Click to ask about this topic</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <h4 className={`text-base sm:text-lg font-semibold ${themeClasses.text} mb-3 sm:mb-4 flex items-center gap-2`}>
                <Brain className="w-4 h-4 text-blue-400 sm:w-5 sm:h-5" />
                Instant Mindfulness Exercises
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                {mindfulnessExercises.map((exercise, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickExercise(exercise)}
                    className={`p-3 sm:p-4 text-left ${themeClasses.cardBg} hover:bg-purple-500/10 rounded-xl transition-all border group hover:scale-105 hover:shadow-lg`}
                  >
                    <div className="text-sm">
                      <div className={`font-semibold ${themeClasses.text} mb-1 sm:mb-2 group-hover:text-purple-400 transition-colors text-sm sm:text-base`}>{exercise.title}</div>
                      <div className={`text-xs ${themeClasses.textSecondary} leading-relaxed`}>{exercise.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}          {/* Enhanced Input Area */}
          <div className="p-3 border-t sm:p-6 border-gray-200/10">
            <div className="flex items-end gap-2 sm:gap-4">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share what's on your mind... I'm here to listen and support you 💙"
                  className={`w-full p-3 sm:p-4 ${themeClasses.input} rounded-2xl border resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 shadow-lg text-sm sm:text-base`}
                  rows={Math.min(input.split('\n').length || 1, 4)}
                  disabled={loading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`px-3 py-3 sm:px-6 sm:py-4 ${themeClasses.button} text-white rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transform hover:scale-105 flex items-center gap-1 sm:gap-2`}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden text-sm sm:inline sm:text-base">Send</span>
              </button>
            </div>
              <div className="flex flex-col items-start justify-between gap-2 mt-3 text-xs sm:flex-row sm:items-center sm:mt-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Your conversations are private and confidential</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="items-center hidden gap-2 text-xs md:flex">
                  <span>Shortcuts: </span>
                  <kbd className={`px-2 py-1 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded text-xs`}>Enter</kbd>
                  <span>send</span>
                  <kbd className={`px-2 py-1 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded text-xs`}>Ctrl+K</kbd>
                  <span>clear</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">Powered by</span>
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-blue-400">Soulynk AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>        {/* Enhanced Disclaimer */}
        <div className={`mt-8 p-6 ${themeClasses.cardBg} rounded-2xl border text-center shadow-xl`}>
          <p className={`text-sm ${themeClasses.textSecondary} mb-6`}>
            <strong>Important:</strong> Soulynk Bot provides supportive information and is not a replacement for professional mental health care. 
            If you're experiencing a mental health crisis, please contact emergency services or a crisis helpline immediately.
          </p>
          
          {/* Enhanced Crisis Resources */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className={`p-5 ${themeClasses.cardBg} rounded-xl border shadow-lg hover:shadow-xl transition-shadow`}>
              <h4 className={`font-bold ${themeClasses.text} mb-3 flex items-center gap-2`}>
                <Heart className="w-5 h-5 text-red-500" />
                🆘 Crisis Support
              </h4>
              <div className={`text-sm ${themeClasses.textSecondary} space-y-2`}>
                <div className="font-semibold">National Suicide Prevention Lifeline</div>
                <div className="font-mono text-lg text-red-500">988</div>
                <div>Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong></div>
              </div>
            </div>
            
            <div className={`p-5 ${themeClasses.cardBg} rounded-xl border shadow-lg hover:shadow-xl transition-shadow`}>
              <h4 className={`font-bold ${themeClasses.text} mb-3 flex items-center gap-2`}>
                <Brain className="w-5 h-5 text-blue-500" />
                🏥 Mental Health Resources
              </h4>
              <div className={`text-sm ${themeClasses.textSecondary} space-y-2`}>
                <div className="font-semibold">SAMHSA National Helpline</div>
                <div className="font-mono text-lg text-blue-500">1-800-662-4357</div>
                <div>24/7 treatment referral service</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Features */}
      {/* <div className="fixed space-y-3 bottom-6 left-6">
        <div className={`${themeClasses.cardBg} p-4 rounded-xl shadow-xl border backdrop-blur-lg hover:scale-105 transition-transform`}>
          <div className="flex items-center gap-3 text-sm">
            <Brain className="w-5 h-5 text-blue-400" />
            <span className={themeClasses.textSecondary}>Mental Wellness Support</span>
          </div>
        </div>
        <div className={`${themeClasses.cardBg} p-4 rounded-xl shadow-xl border backdrop-blur-lg hover:scale-105 transition-transform`}>
          <div className="flex items-center gap-3 text-sm">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className={themeClasses.textSecondary}>Evidence-Based Techniques</span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ChatBox;