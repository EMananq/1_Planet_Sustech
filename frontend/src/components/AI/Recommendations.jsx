import { useState, useEffect, useRef } from 'react';
import { aiApi } from '../../services/api';
import { Bot, Send, Sparkles, Lightbulb, TrendingDown, RefreshCw } from 'lucide-react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await aiApi.getRecommendations();
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await aiApi.chat(userMessage);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.response,
        source: response.data.source 
      }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        error: true 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderRecommendations = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Analyzing your carbon footprint...</p>
        </div>
      );
    }

    if (!recommendations) {
      return (
        <div className="empty-state">
          <p>Unable to load recommendations. Please try again.</p>
          <button className="btn btn-primary" onClick={fetchRecommendations}>
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      );
    }

    // Handle AI-generated text response
    if (typeof recommendations.recommendations === 'string') {
      return (
        <div className="ai-response">
          <div className="ai-response-header">
            <Sparkles size={20} />
            <span>AI Analysis</span>
            {recommendations.source === 'ai' && (
              <span className="source-badge">Powered by AI</span>
            )}
          </div>
          <div className="ai-response-content">
            {recommendations.recommendations.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      );
    }

    // Handle structured recommendations array
    return (
      <div className="recommendations-list">
        {recommendations.recommendations.map((rec, index) => (
          <div key={index} className="recommendation-card">
            <div className="rec-icon">
              <Lightbulb size={24} />
            </div>
            <div className="rec-content">
              <div className="rec-category">{rec.category}</div>
              <p className="rec-tip">{rec.tip}</p>
              {rec.potentialSaving && (
                <div className="rec-saving">
                  <TrendingDown size={16} />
                  <span>Potential saving: {rec.potentialSaving}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {recommendations.source === 'rule-based' && (
          <div className="source-note">
            <p>💡 These are rule-based suggestions. Log more activities to get personalized AI recommendations!</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="recommendations-page">
      <div className="recommendations-section">
        <div className="section-header">
          <h3>
            <Sparkles size={24} />
            Personalized Recommendations
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={fetchRecommendations}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        {renderRecommendations()}
      </div>

      <div className="chat-section">
        <div className="section-header">
          <h3>
            <Bot size={24} />
            Ask AI Assistant
          </h3>
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="chat-empty">
                <Bot size={48} />
                <h4>Carbon Footprint Assistant</h4>
                <p>Ask me anything about reducing your carbon footprint!</p>
                <div className="chat-suggestions">
                  {[
                    "How can I reduce my transport emissions?",
                    "What's the impact of eating less meat?",
                    "Tips for saving energy at home"
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      className="suggestion-btn"
                      onClick={() => {
                        setInputMessage(suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <div className="message-avatar">
                        <Bot size={20} />
                      </div>
                    )}
                    <div className="message-content">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-message assistant">
                    <div className="message-avatar">
                      <Bot size={20} />
                    </div>
                    <div className="message-content typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about reducing your carbon footprint..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={chatLoading}
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={!inputMessage.trim() || chatLoading}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .recommendations-page {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          animation: fadeIn 0.3s ease;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .section-header h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          color: var(--text-primary);
        }
        
        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }
        
        /* Recommendations Section */
        .recommendations-section {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 1.5rem;
        }
        
        .ai-response {
          padding: 1rem;
          background: var(--bg-glass);
          border-radius: var(--border-radius);
        }
        
        .ai-response-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--primary);
          font-weight: 500;
        }
        
        .source-badge {
          margin-left: auto;
          padding: 0.25rem 0.5rem;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 4px;
          font-size: 0.75rem;
        }
        
        .ai-response-content p {
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.7;
        }
        
        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .recommendation-card {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          transition: all var(--transition-fast);
        }
        
        .recommendation-card:hover {
          border-color: var(--primary);
        }
        
        .rec-icon {
          width: 48px;
          height: 48px;
          background: rgba(245, 158, 11, 0.2);
          color: var(--accent);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .rec-content {
          flex: 1;
        }
        
        .rec-category {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--primary);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        
        .rec-tip {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }
        
        .rec-saving {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--success);
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .source-note {
          padding: 1rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--border-radius);
          color: var(--info);
          font-size: 0.9rem;
        }
        
        /* Chat Section */
        .chat-section {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        
        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 400px;
        }
        
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0;
        }
        
        .chat-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: var(--text-secondary);
        }
        
        .chat-empty svg {
          color: var(--primary);
          opacity: 0.5;
          margin-bottom: 1rem;
        }
        
        .chat-empty h4 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        
        .chat-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.5rem;
          justify-content: center;
        }
        
        .suggestion-btn {
          padding: 0.5rem 1rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .suggestion-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        
        .chat-message {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .chat-message.user {
          flex-direction: row-reverse;
        }
        
        .message-avatar {
          width: 32px;
          height: 32px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        
        .message-content {
          max-width: 80%;
          padding: 0.875rem 1.25rem;
          border-radius: 16px;
          line-height: 1.5;
        }
        
        .chat-message.user .message-content {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .chat-message.assistant .message-content {
          background: #f5f0e6;
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
        }
        
        .message-content.typing {
          display: flex;
          gap: 4px;
          padding: 1rem 1.25rem;
        }
        
        .message-content.typing span {
          width: 8px;
          height: 8px;
          background: var(--text-muted);
          border-radius: 50%;
          animation: pulse 1s ease infinite;
        }
        
        .message-content.typing span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .message-content.typing span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        .chat-input-form {
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        
        .chat-input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          background: #faf8f3;
          border: 1px solid #d7ccc8;
          border-radius: 25px;
          color: var(--text-primary);
          font-size: 0.95rem;
        }
        
        .chat-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .chat-send-btn {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        
        .chat-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }
        
        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @media (max-width: 1024px) {
          .recommendations-page {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Recommendations;
