import React, { useState, useEffect, useRef } from 'react';
import { Send, FileText, Bot, User } from 'lucide-react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "नमस्ते! मैं NavyaKosh चैटबॉट हूं। आप मुझसे PDF से संबंधित कोई भी प्रश्न हिंदी या अंग्रेजी में पूछ सकते हैं।\n\nHello! I'm NavyaKosh ChatBot. You can ask me any questions related to PDFs in Hindi or English.",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('auto');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        isBot: true,
        timestamp: new Date(),
        sources: data.sources || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "माफ करें, कुछ गलत हुआ है। कृपया बाद में पुनः प्रयास करें।\n\nSorry, something went wrong. Please try again later.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(148,191,115)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            LCB ChatBot 🌱
          </h1>
        
        </div>

        {/* Main Chat Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Language Selector */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Language / भाषा:
              </label>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="auto">Auto Detect</option>
                <option value="hindi">हिंदी (Hindi)</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.isBot ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isBot 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {message.isBot ? <Bot size={16} /> : <User size={16} />}
                </div>
                
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'text-white'
                  }`}
                  style={{
                    backgroundColor: message.isBot ? '#f3f4f6' : 'rgb(148,191,115)'
                  }}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.text}
                  </div>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div className="text-xs text-gray-600">
                        <strong>Sources:</strong>
                        {message.sources.map((source, index) => (
                          <div key={index} className="truncate">
                            📄 {source}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div
                    className={`text-xs mt-1 ${
                      message.isBot ? 'text-gray-500' : 'text-white/70'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="अपना सवाल यहाँ लिखें... / Type your question here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="2"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: 'rgb(148,191,115)' }}
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/70 text-sm">
          <p>Powered by Multiple LLMs • NavyaKosh PDF Assistant</p>
        </div>
      </div>
    </div>
  );
};

export default App;