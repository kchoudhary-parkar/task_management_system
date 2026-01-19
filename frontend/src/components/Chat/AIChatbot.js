// import React, { useState, useRef, useEffect } from 'react';
// import { MessageCircle, X, Send, Loader, Sparkles, TrendingUp, Calendar, CheckCircle, AlertCircle, Minimize2 } from 'lucide-react';

// const AIChatbot = ({ user }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       role: 'assistant',
//       content: `Hi ${user?.name || 'there'}! 👋 I'm your AI assistant. How can I help?`,
//       timestamp: new Date(),
//     }
//   ]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (isOpen && !isMinimized && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isOpen, isMinimized]);

//   const quickPrompts = [
//     { icon: <TrendingUp size={14} />, text: "Summary", query: "Give me a summary of my tasks" },
//     { icon: <Calendar size={14} />, text: "Deadlines", query: "What are my upcoming deadlines?" },
//     { icon: <CheckCircle size={14} />, text: "Progress", query: "Show my project progress" },
//     { icon: <AlertCircle size={14} />, text: "Overdue", query: "List overdue tasks" },
//   ];

//   const handleSend = async () => {
//     if (!input.trim() || isLoading) return;

//     const userMessage = {
//       role: 'user',
//       content: input.trim(),
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       const tabKey = sessionStorage.getItem('tab_session_key');
//       const response = await fetch('http://localhost:8000/api/chat/ask', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//           'X-Tab-Session-Key': tabKey,
//         },
//         body: JSON.stringify({
//           message: input,
//           conversationHistory: messages.slice(-10),
//         }),
//       });

//       if (!response.ok) throw new Error('Failed to get AI response');

//       const data = await response.json();

//       setMessages((prev) => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: data.response || "Here's what I found...",
//           timestamp: new Date(),
//           data: data.data,
//         },
//       ]);
//     } catch (error) {
//       console.error('Chat error:', error);
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: 'Sorry, something went wrong. Please try again.',
//           isError: true,
//           timestamp: new Date(),
//         },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const handleQuickPrompt = (query) => {
//     setInput(query);
//     setTimeout(() => handleSend(), 80);
//   };

//   return (
//     <>
//       {/* Floating Button */}
//       <button
//         onClick={() => {
//           setIsOpen(!isOpen);
//           setIsMinimized(false);
//         }}
//         className="chat-fab"
//         style={{
//           position: 'fixed',
//           bottom: '20px',
//           right: '20px',
//           width: '56px',
//           height: '56px',
//           borderRadius: '50%',
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           border: 'none',
//           color: 'white',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
//           cursor: 'pointer',
//           zIndex: 1000,
//           transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
//           e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.5)';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.transform = 'scale(1) translateY(0)';
//           e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
//         }}
//       >
//         {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
//         {!isOpen && (
//           <span style={{
//             position: 'absolute',
//             top: '4px',
//             right: '4px',
//             width: '12px',
//             height: '12px',
//             borderRadius: '50%',
//             background: '#10b981',
//             border: '2px solid white',
//             animation: 'pulse-dot 2s infinite',
//           }} />
//         )}
//       </button>

//       {/* Chat Window */}
//       {isOpen && (
//         <div
//           style={{
//             position: 'fixed',
//             bottom: isMinimized ? '-450px' : '90px',
//             right: '20px',
//             width: '360px',
//             maxWidth: 'calc(100vw - 40px)',
//             height: isMinimized ? '60px' : '520px',
//             maxHeight: 'calc(100vh - 120px)',
//             display: 'flex',
//             flexDirection: 'column',
//             borderRadius: '16px',
//             overflow: 'hidden',
//             background: 'var(--bg-card, white)',
//             border: '1px solid var(--border-primary, rgba(0,0,0,0.1))',
//             boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
//             zIndex: 999,
//             transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
//             animation: 'slideUpFade 0.3s ease-out',
//           }}
//         >
//           {/* Header */}
//           <div
//             style={{
//               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//               padding: '14px 18px',
//               color: 'white',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '12px',
//               borderBottom: '1px solid rgba(255,255,255,0.1)',
//               cursor: isMinimized ? 'pointer' : 'default',
//             }}
//             onClick={() => isMinimized && setIsMinimized(false)}
//           >
//             <div
//               style={{
//                 width: '36px',
//                 height: '36px',
//                 borderRadius: '50%',
//                 background: 'rgba(255, 255, 255, 0.2)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 backdropFilter: 'blur(10px)',
//               }}
//             >
//               <Sparkles size={18} />
//             </div>
//             <div style={{ flex: 1 }}>
//               <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em' }}>
//                 AI Assistant
//               </h3>
//               <p style={{ margin: 0, fontSize: '11px', opacity: 0.9 }}>
//                 Powered by Claude
//               </p>
//             </div>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setIsMinimized(!isMinimized);
//               }}
//               style={{
//                 background: 'rgba(255, 255, 255, 0.2)',
//                 border: 'none',
//                 borderRadius: '6px',
//                 width: '28px',
//                 height: '28px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer',
//                 color: 'white',
//                 transition: 'all 0.2s',
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
//               }}
//             >
//               <Minimize2 size={14} />
//             </button>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setIsOpen(false);
//               }}
//               style={{
//                 background: 'rgba(255, 255, 255, 0.2)',
//                 border: 'none',
//                 borderRadius: '6px',
//                 width: '28px',
//                 height: '28px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer',
//                 color: 'white',
//                 transition: 'all 0.2s',
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
//               }}
//             >
//               <X size={14} />
//             </button>
//           </div>

//           {/* Messages */}
//           {!isMinimized && (
//             <>
//               <div
//                 style={{
//                   flex: 1,
//                   overflowY: 'auto',
//                   padding: '16px',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   gap: '12px',
//                   background: 'var(--bg-secondary, #f9fafb)',
//                 }}
//               >
//                 {messages.map((msg, idx) => (
//                   <div
//                     key={idx}
//                     style={{
//                       display: 'flex',
//                       flexDirection: 'column',
//                       alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
//                       animation: 'fadeIn 0.2s ease-out',
//                     }}
//                   >
//                     <div
//                       style={{
//                         maxWidth: '80%',
//                         padding: '10px 14px',
//                         borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
//                         background: msg.role === 'user'
//                           ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
//                           : msg.isError
//                           ? '#fee2e2'
//                           : 'white',
//                         color: msg.role === 'user' ? 'white' : msg.isError ? '#dc2626' : 'var(--text-primary, #1f2937)',
//                         fontSize: '13px',
//                         lineHeight: '1.5',
//                         boxShadow: msg.role === 'assistant' && !msg.isError ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
//                         whiteSpace: 'pre-wrap',
//                         wordBreak: 'break-word',
//                         fontWeight: msg.role === 'user' ? 500 : 400,
//                       }}
//                     >
//                       {msg.content}
//                     </div>
//                     <span
//                       style={{
//                         fontSize: '10px',
//                         color: 'var(--text-muted, #9ca3af)',
//                         marginTop: '4px',
//                         marginLeft: msg.role === 'user' ? 0 : '4px',
//                         marginRight: msg.role === 'user' ? '4px' : 0,
//                       }}
//                     >
//                       {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </span>
//                   </div>
//                 ))}

//                 {isLoading && (
//                   <div style={{ 
//                     display: 'flex', 
//                     alignItems: 'center', 
//                     gap: '8px',
//                     padding: '10px 14px',
//                     background: 'white',
//                     borderRadius: '14px 14px 14px 2px',
//                     maxWidth: '100px',
//                     boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
//                   }}>
//                     <Loader size={14} style={{ animation: 'spin 1s linear infinite', color: '#667eea' }} />
//                     <span style={{ fontSize: '13px', color: '#667eea', fontWeight: 500 }}>
//                       Thinking
//                     </span>
//                   </div>
//                 )}

//                 <div ref={messagesEndRef} />
//               </div>

//               {/* Quick Prompts */}
//               {messages.length === 1 && !isLoading && (
//                 <div
//                   style={{
//                     padding: '12px 16px',
//                     borderTop: '1px solid var(--border-primary, #e5e7eb)',
//                     background: 'white',
//                   }}
//                 >
//                   <p style={{ 
//                     fontSize: '11px', 
//                     color: 'var(--text-secondary, #6b7280)', 
//                     margin: '0 0 8px 0',
//                     fontWeight: 600,
//                     textTransform: 'uppercase',
//                     letterSpacing: '0.5px',
//                   }}>
//                     Quick Actions
//                   </p>
//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
//                     {quickPrompts.map((prompt, idx) => (
//                       <button
//                         key={idx}
//                         onClick={() => handleQuickPrompt(prompt.query)}
//                         style={{
//                           padding: '8px 10px',
//                           borderRadius: '8px',
//                           border: '1px solid var(--border-primary, #e5e7eb)',
//                           background: 'white',
//                           fontSize: '12px',
//                           cursor: 'pointer',
//                           display: 'flex',
//                           alignItems: 'center',
//                           gap: '6px',
//                           color: 'var(--text-secondary, #6b7280)',
//                           transition: 'all 0.2s',
//                           textAlign: 'left',
//                           fontWeight: 500,
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.background = '#f3f4f6';
//                           e.currentTarget.style.borderColor = '#667eea';
//                           e.currentTarget.style.color = '#667eea';
//                           e.currentTarget.style.transform = 'translateY(-1px)';
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.background = 'white';
//                           e.currentTarget.style.borderColor = 'var(--border-primary, #e5e7eb)';
//                           e.currentTarget.style.color = 'var(--text-secondary, #6b7280)';
//                           e.currentTarget.style.transform = 'translateY(0)';
//                         }}
//                       >
//                         <div style={{ color: '#667eea', display: 'flex' }}>
//                           {prompt.icon}
//                         </div>
//                         {prompt.text}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Input */}
//               <div
//                 style={{
//                   padding: '12px 16px',
//                   borderTop: '1px solid var(--border-primary, #e5e7eb)',
//                   background: 'white',
//                   display: 'flex',
//                   gap: '8px',
//                   alignItems: 'center',
//                 }}
//               >
//                 <input
//                   ref={inputRef}
//                   type="text"
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyPress={handleKeyPress}
//                   placeholder="Ask about your tasks..."
//                   disabled={isLoading}
//                   style={{
//                     flex: 1,
//                     padding: '10px 14px',
//                     borderRadius: '10px',
//                     border: '1px solid var(--border-primary, #e5e7eb)',
//                     fontSize: '13px',
//                     outline: 'none',
//                     background: 'var(--bg-secondary, #f9fafb)',
//                     color: 'var(--text-primary, #1f2937)',
//                     transition: 'all 0.2s',
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.borderColor = '#667eea';
//                     e.target.style.background = 'white';
//                     e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.borderColor = 'var(--border-primary, #e5e7eb)';
//                     e.target.style.background = 'var(--bg-secondary, #f9fafb)';
//                     e.target.style.boxShadow = 'none';
//                   }}
//                 />
//                 <button
//                   onClick={handleSend}
//                   disabled={!input.trim() || isLoading}
//                   style={{
//                     width: '40px',
//                     height: '40px',
//                     borderRadius: '10px',
//                     border: 'none',
//                     background: input.trim() && !isLoading
//                       ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
//                       : '#e5e7eb',
//                     color: 'white',
//                     cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     transition: 'all 0.2s',
//                     boxShadow: input.trim() && !isLoading ? '0 4px 10px rgba(102, 126, 234, 0.3)' : 'none',
//                   }}
//                   onMouseEnter={(e) => {
//                     if (input.trim() && !isLoading) {
//                       e.currentTarget.style.transform = 'scale(1.05)';
//                       e.currentTarget.style.boxShadow = '0 6px 14px rgba(102, 126, 234, 0.4)';
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.transform = 'scale(1)';
//                     e.currentTarget.style.boxShadow = input.trim() && !isLoading ? '0 4px 10px rgba(102, 126, 234, 0.3)' : 'none';
//                   }}
//                 >
//                   <Send size={18} />
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       )}

//       <style>
//     {`
//         /* 1. Define CSS variables for both themes */
//     :root {
//   /* Light theme (default) */
//   --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   --bg-page: #f8fafc;
//   --bg-card: white;
//   --bg-hover: #f1f5f9;
//   --bg-subtle: #f8fafc;
//   --text-primary: #1e293b;
//   --text-secondary: #64748b;
//   --text-muted: #94a3b8;
//   --border-color: rgba(0, 0, 0, 0.08);
//   --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
//   --shadow-md: 0 8px 16px rgba(0, 0, 0, 0.15);
//   --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.08);
// }

// /* Dark theme */
// [data-theme="dark"] {
//   --bg-gradient: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
//   --bg-page: #0f172a;
//   --bg-card: #1e293b;
//   --bg-hover: #334155;
//   --bg-subtle: #1e293b;
//   --text-primary: #f1f5f9;
//   --text-secondary: #cbd5e1;
//   --text-muted: #94a3b8;
//   --border-color: rgba(255, 255, 255, 0.08);
//   --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.45);
//   --shadow-md: 0 8px 16px rgba(0, 0, 0, 0.6);
//   --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.35);
// }

// /* 2. Apply variables to your existing classes */

// .dashboard-page {
//   min-height: 100vh;
//   background: var(--bg-gradient);
//   padding: 24px;
//   color: var(--text-primary);
//   transition: background 0.4s ease;
// }

// .project-stat-card,
// .deadlines-section-new,
// .activity-section-new,
// .error-container {
//   background: var(--bg-card);
//   box-shadow: var(--shadow-card);
//   color: var(--text-primary);
// }

// .project-stat-card:hover {
//   transform: translateY(-4px);
//   box-shadow: var(--shadow-md);
// }

// .pstat-value {
//   color: var(--text-primary);
// }

// .pstat-label {
//   color: var(--text-secondary);
// }

// .section-header h2 {
//   color: var(--text-primary);
// }

// .deadline-item {
//   background: var(--bg-subtle);
// }

// .deadline-item:hover {
//   background: var(--bg-hover);
// }

// .no-deadlines,
// .no-activity {
//   color: var(--text-muted);
// }

// /* Some accent colors that change per theme */
// .btn-export-pdf {
//   background: #f87171;          /* softer red in dark */
// }
// [data-theme="dark"] .btn-export-pdf {
//   background: #dc2626;
// }

// .btn-export-excel {
//   background: #34d399;
// }
// [data-theme="dark"] .btn-export-excel {
//   background: #10b981;
// }

// .btn-export-csv {
//   background: #60a5fa;
// }
// [data-theme="dark"] .btn-export-csv {
//   background: #3b82f6;
// }

// /* Headers & text */
// .header-content h1 {
//   color: white; /* stays white on gradient in both themes */
//   text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
// }

// .dashboard-subtitle {
//   color: rgba(255, 255, 255, 0.9);
// }

// /* Badges & status - adjust for better contrast in dark mode */
// .priority-badge.high,
// .activity-status-badge.to-do {
//   background: rgba(239, 68, 68, 0.15);
//   color: #fca5a5;
// }

// [data-theme="dark"] .priority-badge.high,
// [data-theme="dark"] .activity-status-badge.to-do {
//   background: rgba(239, 68, 68, 0.25);
//   color: #f87171;
// }

// /* ... do similar adjustments for other priorities/statuses */`}</style>
//     </>
//   );
// };

// export default AIChatbot;
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Sparkles, TrendingUp, Calendar, CheckCircle, AlertCircle, Minimize2, Zap, Target } from 'lucide-react';

const AIChatbot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name || 'there'}! 👋 I'm your AI productivity assistant. I can help you understand your tasks, suggest improvements, and keep you on track. What would you like to know?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const quickPrompts = [
    { icon: <TrendingUp size={14} />, text: "Summary", query: "Give me a summary of my tasks and what I should focus on" },
    { icon: <Calendar size={14} />, text: "Deadlines", query: "What are my upcoming deadlines and critical tasks?" },
    { icon: <CheckCircle size={14} />, text: "Progress", query: "How is my project progress looking?" },
    { icon: <AlertCircle size={14} />, text: "Risks", query: "What potential issues or risks should I be aware of?" },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const tabKey = sessionStorage.getItem('tab_session_key');
      const response = await fetch('http://localhost:8000/api/chat/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'X-Tab-Session-Key': tabKey,
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.slice(-10),
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response || "Here's what I found...",
          timestamp: new Date(),
          insights: data.insights || [],
          data: data.data,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (query) => {
    setInput(query);
    setTimeout(() => handleSend(), 80);
  };

  const renderInsights = (insights) => {
    if (!insights || insights.length === 0) return null;

    return (
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {insights.map((insight, idx) => (
          <div
            key={idx}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              borderLeft: '3px solid',
              background: getInsightBg(insight.type),
              borderLeftColor: getInsightColor(insight.type),
              fontSize: '12px',
              color: getInsightTextColor(insight.type),
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>
              {insight.icon} {insight.title}
            </div>
            <div style={{ opacity: 0.9, fontSize: '11px' }}>
              {insight.description}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getInsightColor = (type) => {
    switch(type) {
      case 'warning': return '#ef4444';
      case 'success': return '#10b981';
      case 'info': return '#3b82f6';
      default: return '#8b5cf6';
    }
  };

  const getInsightBg = (type) => {
    switch(type) {
      case 'warning': return '#fef2f2';
      case 'success': return '#f0fdf4';
      case 'info': return '#eff6ff';
      default: return '#faf5ff';
    }
  };

  const getInsightTextColor = (type) => {
    switch(type) {
      case 'warning': return '#991b1b';
      case 'success': return '#065f46';
      case 'info': return '#0c4a6e';
      default: return '#4c1d95';
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="chat-fab"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid white',
            animation: 'pulse-dot 2s infinite',
          }} />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: isMinimized ? '-450px' : '90px',
            right: '20px',
            width: '380px',
            maxWidth: 'calc(100vw - 40px)',
            height: '470px',
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
            zIndex: 999,
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: 'slideUpFade 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '14px 18px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              cursor: isMinimized ? 'pointer' : 'default',
            }}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em' }}>
                AI Assistant
              </h3>
              <p style={{ margin: 0, fontSize: '11px', opacity: 0.9 }}>
                Powered by DOIT AI
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <Minimize2 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: '#f9fafb',
                }}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      animation: 'fadeIn 0.2s ease-out',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : msg.isError
                          ? '#fee2e2'
                          : 'white',
                        color: msg.role === 'user' ? 'white' : msg.isError ? '#dc2626' : '#1f2937',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        boxShadow: msg.role === 'assistant' && !msg.isError ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontWeight: msg.role === 'user' ? 500 : 400,
                      }}
                    >
                      {msg.content}
                      {msg.insights && msg.insights.length > 0 && renderInsights(msg.insights)}
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#9ca3af',
                        marginTop: '4px',
                        marginLeft: msg.role === 'user' ? 0 : '4px',
                        marginRight: msg.role === 'user' ? '4px' : 0,
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '10px 14px',
                    background: 'white',
                    borderRadius: '14px 14px 14px 2px',
                    maxWidth: '120px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                  }}>
                    <Loader size={14} style={{ animation: 'spin 1s linear infinite', color: '#667eea' }} />
                    <span style={{ fontSize: '13px', color: '#667eea', fontWeight: 500 }}>
                      Analyzing...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              {messages.length === 1 && !isLoading && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderTop: '1px solid #e5e7eb',
                    background: 'white',
                  }}
                >
                  <p style={{ 
                    fontSize: '11px', 
                    color: '#6b7280', 
                    margin: '0 0 8px 0',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Quick Actions
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickPrompt(prompt.query)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          background: 'white',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#6b7280',
                          transition: 'all 0.2s',
                          textAlign: 'left',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f3f4f6';
                          e.currentTarget.style.borderColor = '#667eea';
                          e.currentTarget.style.color = '#667eea';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.color = '#6b7280';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ color: '#667eea', display: 'flex' }}>
                          {prompt.icon}
                        </div>
                        {prompt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid #e5e7eb',
                  background: 'white',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your tasks..."
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#f9fafb',
                    color: '#1f2937',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    border: 'none',
                    background: input.trim() && !isLoading
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : '#e5e7eb',
                    color: 'white',
                    cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    boxShadow: input.trim() && !isLoading ? '0 4px 10px rgba(102, 126, 234, 0.3)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (input.trim() && !isLoading) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 14px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = input.trim() && !isLoading ? '0 4px 10px rgba(102, 126, 234, 0.3)' : 'none';
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
};

export default AIChatbot;