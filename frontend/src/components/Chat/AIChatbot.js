// // import React, { useState, useRef, useEffect } from 'react';
// // import { MessageCircle, X, Send, Loader, Sparkles, TrendingUp, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

// // const AIChatbot = ({ user }) => {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [messages, setMessages] = useState([
// //     {
// //       role: 'assistant',
// //       content: `Hi ${user?.name || 'there'}! 👋 I'm your AI task assistant. I can help you with insights about your projects, tasks, sprints, and productivity. What would you like to know?`,
// //       timestamp: new Date(),
// //     }
// //   ]);
// //   const [input, setInput] = useState('');
// //   const [isLoading, setIsLoading] = useState(false);
// //   const messagesEndRef = useRef(null);
// //   const inputRef = useRef(null);

// //   const scrollToBottom = () => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   };

// //   useEffect(() => {
// //     scrollToBottom();
// //   }, [messages]);

// //   useEffect(() => {
// //     if (isOpen && inputRef.current) {
// //       inputRef.current.focus();
// //     }
// //   }, [isOpen]);

// //   const quickPrompts = [
// //     { icon: <TrendingUp size={16} />, text: "Show my task summary", query: "Give me a summary of my tasks" },
// //     { icon: <Calendar size={16} />, text: "Upcoming deadlines", query: "What are my upcoming deadlines?" },
// //     { icon: <CheckCircle size={16} />, text: "Project progress", query: "Show me project progress" },
// //     { icon: <AlertCircle size={16} />, text: "Overdue tasks", query: "Do I have any overdue tasks?" },
// //   ];

// //   const handleSend = async () => {
// //     if (!input.trim() || isLoading) return;

// //     const userMessage = {
// //       role: 'user',
// //       content: input,
// //       timestamp: new Date(),
// //     };

// //     setMessages(prev => [...prev, userMessage]);
// //     setInput('');
// //     setIsLoading(true);

// //     try {
// //       // Call your backend AI endpoint
// //       const response = await fetch('http://localhost:8000/api/chat/ask', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'Authorization': `Bearer ${localStorage.getItem('token')}`,
// //         },
// //         body: JSON.stringify({ 
// //           message: input,
// //           conversationHistory: messages.slice(-10) // Send last 10 messages for context
// //         }),
// //       });

// //       if (!response.ok) throw new Error('Failed to get response');

// //       const data = await response.json();

// //       const assistantMessage = {
// //         role: 'assistant',
// //         content: data.response,
// //         timestamp: new Date(),
// //         data: data.data, // Additional structured data if needed
// //       };

// //       setMessages(prev => [...prev, assistantMessage]);
// //     } catch (error) {
// //       console.error('Chat error:', error);
// //       setMessages(prev => [...prev, {
// //         role: 'assistant',
// //         content: 'Sorry, I encountered an error. Please try again.',
// //         timestamp: new Date(),
// //         isError: true,
// //       }]);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleKeyPress = (e) => {
// //     if (e.key === 'Enter' && !e.shiftKey) {
// //       e.preventDefault();
// //       handleSend();
// //     }
// //   };

// //   const handleQuickPrompt = (query) => {
// //     setInput(query);
// //     setTimeout(() => handleSend(), 100);
// //   };

// //   return (
// //     <>
// //       {/* Floating Chat Button */}
// //       <button
// //         onClick={() => setIsOpen(!isOpen)}
// //         className="chat-fab"
// //         aria-label="Open AI Assistant"
// //         style={{
// //           position: 'fixed',
// //           bottom: '24px',
// //           right: '24px',
// //           width: '60px',
// //           height: '60px',
// //           borderRadius: '50%',
// //           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
// //           border: 'none',
// //           boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
// //           cursor: 'pointer',
// //           display: 'flex',
// //           alignItems: 'center',
// //           justifyContent: 'center',
// //           color: 'white',
// //           transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
// //           zIndex: 1000,
// //         }}
// //         onMouseEnter={(e) => {
// //           e.currentTarget.style.transform = 'scale(1.1)';
// //           e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
// //         }}
// //         onMouseLeave={(e) => {
// //           e.currentTarget.style.transform = 'scale(1)';
// //           e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
// //         }}
// //       >
// //         {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
// //       </button>

// //       {/* Chat Window */}
// //       {isOpen && (
// //         <div
// //           className="chat-window"
// //           style={{
// //             position: 'fixed',
// //             bottom: '100px',
// //             right: '24px',
// //             width: '400px',
// //             maxWidth: 'calc(100vw - 48px)',
// //             height: '600px',
// //             maxHeight: 'calc(100vh - 140px)',
// //             background: 'var(--bg-card, white)',
// //             borderRadius: '16px',
// //             boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
// //             display: 'flex',
// //             flexDirection: 'column',
// //             overflow: 'hidden',
// //             zIndex: 999,
// //             border: '1px solid var(--border-primary, #e5e7eb)',
// //             animation: 'slideUp 0.3s ease-out',
// //           }}
// //         >
// //           {/* Header */}
// //           <div
// //             style={{
// //               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
// //               padding: '20px',
// //               color: 'white',
// //               display: 'flex',
// //               alignItems: 'center',
// //               gap: '12px',
// //             }}
// //           >
// //             <div
// //               style={{
// //                 width: '40px',
// //                 height: '40px',
// //                 borderRadius: '50%',
// //                 background: 'rgba(255, 255, 255, 0.2)',
// //                 display: 'flex',
// //                 alignItems: 'center',
// //                 justifyContent: 'center',
// //               }}
// //             >
// //               <Sparkles size={20} />
// //             </div>
// //             <div style={{ flex: 1 }}>
// //               <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>AI Assistant</h3>
// //               <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Your personal task insights</p>
// //             </div>
// //           </div>

// //           {/* Messages */}
// //           <div
// //             style={{
// //               flex: 1,
// //               overflowY: 'auto',
// //               padding: '20px',
// //               display: 'flex',
// //               flexDirection: 'column',
// //               gap: '16px',
// //               background: 'var(--bg-secondary, #f9fafb)',
// //             }}
// //           >
// //             {messages.map((msg, idx) => (
// //               <div
// //                 key={idx}
// //                 style={{
// //                   display: 'flex',
// //                   flexDirection: 'column',
// //                   alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
// //                 }}
// //               >
// //                 <div
// //                   style={{
// //                     maxWidth: '80%',
// //                     padding: '12px 16px',
// //                     borderRadius: '12px',
// //                     background: msg.role === 'user'
// //                       ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
// //                       : msg.isError
// //                       ? '#fee2e2'
// //                       : 'white',
// //                     color: msg.role === 'user' ? 'white' : msg.isError ? '#dc2626' : 'var(--text-primary, #1f2937)',
// //                     fontSize: '14px',
// //                     lineHeight: '1.5',
// //                     boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
// //                     whiteSpace: 'pre-wrap',
// //                     wordBreak: 'break-word',
// //                   }}
// //                 >
// //                   {msg.content}
// //                 </div>
// //                 <span
// //                   style={{
// //                     fontSize: '11px',
// //                     color: 'var(--text-muted, #9ca3af)',
// //                     marginTop: '4px',
// //                   }}
// //                 >
// //                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //                 </span>
// //               </div>
// //             ))}

// //             {isLoading && (
// //               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
// //                 <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
// //                 <span style={{ fontSize: '14px', color: 'var(--text-muted, #9ca3af)' }}>
// //                   Thinking...
// //                 </span>
// //               </div>
// //             )}

// //             <div ref={messagesEndRef} />
// //           </div>

// //           {/* Quick Prompts */}
// //           {messages.length === 1 && (
// //             <div
// //               style={{
// //                 padding: '12px 20px',
// //                 borderTop: '1px solid var(--border-primary, #e5e7eb)',
// //                 display: 'flex',
// //                 flexDirection: 'column',
// //                 gap: '8px',
// //               }}
// //             >
// //               <p style={{ fontSize: '12px', color: 'var(--text-muted, #9ca3af)', margin: '0 0 4px 0' }}>
// //                 Quick prompts:
// //               </p>
// //               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
// //                 {quickPrompts.map((prompt, idx) => (
// //                   <button
// //                     key={idx}
// //                     onClick={() => handleQuickPrompt(prompt.query)}
// //                     style={{
// //                       padding: '6px 12px',
// //                       borderRadius: '8px',
// //                       border: '1px solid var(--border-primary, #e5e7eb)',
// //                       background: 'white',
// //                       fontSize: '12px',
// //                       cursor: 'pointer',
// //                       display: 'flex',
// //                       alignItems: 'center',
// //                       gap: '6px',
// //                       color: 'var(--text-secondary, #6b7280)',
// //                       transition: 'all 0.2s',
// //                     }}
// //                     onMouseEnter={(e) => {
// //                       e.currentTarget.style.background = '#f3f4f6';
// //                       e.currentTarget.style.borderColor = '#667eea';
// //                     }}
// //                     onMouseLeave={(e) => {
// //                       e.currentTarget.style.background = 'white';
// //                       e.currentTarget.style.borderColor = 'var(--border-primary, #e5e7eb)';
// //                     }}
// //                   >
// //                     {prompt.icon}
// //                     {prompt.text}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>
// //           )}

// //           {/* Input */}
// //           <div
// //             style={{
// //               padding: '16px 20px',
// //               borderTop: '1px solid var(--border-primary, #e5e7eb)',
// //               background: 'white',
// //               display: 'flex',
// //               gap: '12px',
// //               alignItems: 'center',
// //             }}
// //           >
// //             <input
// //               ref={inputRef}
// //               type="text"
// //               value={input}
// //               onChange={(e) => setInput(e.target.value)}
// //               onKeyPress={handleKeyPress}
// //               placeholder="Ask me anything..."
// //               disabled={isLoading}
// //               style={{
// //                 flex: 1,
// //                 padding: '12px 16px',
// //                 borderRadius: '12px',
// //                 border: '1px solid var(--border-primary, #e5e7eb)',
// //                 fontSize: '14px',
// //                 outline: 'none',
// //                 background: 'var(--bg-secondary, #f9fafb)',
// //                 color: 'var(--text-primary, #1f2937)',
// //                 transition: 'all 0.2s',
// //               }}
// //               onFocus={(e) => {
// //                 e.target.style.borderColor = '#667eea';
// //                 e.target.style.background = 'white';
// //               }}
// //               onBlur={(e) => {
// //                 e.target.style.borderColor = 'var(--border-primary, #e5e7eb)';
// //                 e.target.style.background = 'var(--bg-secondary, #f9fafb)';
// //               }}
// //             />
// //             <button
// //               onClick={handleSend}
// //               disabled={!input.trim() || isLoading}
// //               style={{
// //                 width: '44px',
// //                 height: '44px',
// //                 borderRadius: '12px',
// //                 border: 'none',
// //                 background: input.trim() && !isLoading
// //                   ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
// //                   : '#e5e7eb',
// //                 color: 'white',
// //                 cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
// //                 display: 'flex',
// //                 alignItems: 'center',
// //                 justifyContent: 'center',
// //                 transition: 'all 0.2s',
// //               }}
// //               onMouseEnter={(e) => {
// //                 if (input.trim() && !isLoading) {
// //                   e.currentTarget.style.transform = 'scale(1.05)';
// //                 }
// //               }}
// //               onMouseLeave={(e) => {
// //                 e.currentTarget.style.transform = 'scale(1)';
// //               }}
// //             >
// //               <Send size={20} />
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       <style>{`
// //         @keyframes slideUp {
// //           from {
// //             opacity: 0;
// //             transform: translateY(20px);
// //           }
// //           to {
// //             opacity: 1;
// //             transform: translateY(0);
// //           }
// //         }

// //         @keyframes spin {
// //           0% { transform: rotate(0deg); }
// //           100% { transform: rotate(360deg); }
// //         }

// //         @media (max-width: 480px) {
// //           .chat-window {
// //             bottom: 0 !important;
// //             right: 0 !important;
// //             width: 100vw !important;
// //             max-width: 100vw !important;
// //             height: 100vh !important;
// //             max-height: 100vh !important;
// //             border-radius: 0 !important;
// //           }

// //           .chat-fab {
// //             bottom: 16px !important;
// //             right: 16px !important;
// //           }
// //         }
// //       `}</style>
// //     </>
// //   );
// // };

// // export default AIChatbot; 
// import React, { useState, useRef, useEffect } from 'react';
// import { MessageCircle, X, Send, Loader, Sparkles, TrendingUp, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

// const AIChatbot = ({ user }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       role: 'assistant',
//       content: `Hi ${user?.name || 'there'}! 👋 I'm your AI task assistant. How can I help today?`,
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

//   useEffect(() => scrollToBottom(), [messages]);
//   useEffect(() => {
//     if (isOpen && inputRef.current) inputRef.current.focus();
//   }, [isOpen]);

//   // ... (keep your handleSend, handleQuickPrompt, handleKeyPress logic the same)

//   return (
//     <>
//       {/* Floating Action Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="chat-fab"
//         aria-label="Toggle AI Assistant"
//       >
//         {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
//       </button>

//       {/* Chat Window */}
//       {isOpen && (
//         <div className="chat-window glass-card">
//           {/* Header */}
//           <div className="chat-header">
//             <div className="chat-avatar">
//               <Sparkles size={24} />
//             </div>
//             <div>
//               <h3>AI Task Assistant</h3>
//               <p>Powered by your project data</p>
//             </div>
//           </div>

//           {/* Messages Area */}
//           <div className="chat-messages">
//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}
//               >
//                 <div className={`message-bubble ${msg.isError ? 'error' : ''}`}>
//                   {msg.content}
//                 </div>
//                 <span className="message-time">
//                   {new Date(msg.timestamp).toLocaleTimeString([], {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                   })}
//                 </span>
//               </div>
//             ))}

//             {isLoading && (
//               <div className="loading-indicator">
//                 <Loader className="spin" size={18} />
//                 <span>Thinking...</span>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* Quick Prompts (shown only at start) */}
//           {messages.length === 1 && (
//             <div className="quick-prompts">
//               <p className="quick-title">Quick actions:</p>
//               <div className="quick-grid">
//                 {quickPrompts.map((prompt, idx) => (
//                   <button
//                     key={idx}
//                     className="quick-btn"
//                     onClick={() => handleQuickPrompt(prompt.query)}
//                   >
//                     {prompt.icon}
//                     {prompt.text}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Input Area */}
//           <div className="chat-input-container">
//             <input
//               ref={inputRef}
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Ask about tasks, deadlines, progress..."
//               disabled={isLoading}
//               className="chat-input"
//             />
//             <button
//               onClick={handleSend}
//               disabled={!input.trim() || isLoading}
//               className={`send-btn ${!input.trim() || isLoading ? 'disabled' : ''}`}
//             >
//               <Send size={22} />
//             </button>
//           </div>
//         </div>
//       )}

//       <style jsx global>{`
//         .chat-fab {
//           position: fixed;
//           bottom: 28px;
//           right: 28px;
//           width: 64px;
//           height: 64px;
//           border-radius: 50%;
//           background: var(--bg-navbar);
//           border: none;
//           color: white;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           box-shadow: var(--shadow-lg);
//           cursor: pointer;
//           z-index: 1000;
//           transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
//         }

//         .chat-fab:hover {
//           transform: scale(1.12) translateY(-4px);
//           box-shadow: 0 16px 48px rgba(38, 132, 255, 0.4);
//         }

//         .chat-window {
//           position: fixed;
//           bottom: 110px;
//           right: 28px;
//           width: 420px;
//           max-width: calc(100vw - 56px);
//           height: 640px;
//           max-height: calc(100vh - 140px);
//           display: flex;
//           flex-direction: column;
//           border-radius: 20px;
//           overflow: hidden;
//           background: var(--bg-card);
//           border: 1px solid var(--border-primary);
//           box-shadow: var(--shadow-lg);
//           backdrop-filter: blur(20px);
//           -webkit-backdrop-filter: blur(20px);
//           z-index: 999;
//           transition: all 0.3s ease;
//         }

//         .chat-header {
//           background: var(--bg-navbar);
//           padding: 20px 24px;
//           color: white;
//           display: flex;
//           align-items: center;
//           gap: 16px;
//           border-bottom: 1px solid var(--border-primary);
//         }

//         .chat-avatar {
//           width: 48px;
//           height: 48px;
//           border-radius: 50%;
//           background: rgba(255,255,255,0.18);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .chat-header h3 {
//           margin: 0;
//           font-size: 18px;
//           font-weight: 600;
//         }

//         .chat-header p {
//           margin: 0;
//           font-size: 13px;
//           opacity: 0.9;
//         }

//         .chat-messages {
//           flex: 1;
//           overflow-y: auto;
//           padding: 24px;
//           display: flex;
//           flex-direction: column;
//           gap: 20px;
//           background: var(--bg-secondary);
//         }

//         .message-wrapper {
//           display: flex;
//           flex-direction: column;
//           max-width: 82%;
//         }

//         .message-wrapper.user {
//           align-self: flex-end;
//           align-items: flex-end;
//         }

//         .message-wrapper.assistant {
//           align-self: flex-start;
//           align-items: flex-start;
//         }

//         .message-bubble {
//           padding: 14px 18px;
//           border-radius: 18px;
//           font-size: 15px;
//           line-height: 1.45;
//           background: var(--bg-card);
//           color: var(--text-primary);
//           box-shadow: var(--shadow-sm);
//           border: 1px solid var(--border-secondary);
//           position: relative;
//         }

//         .message-wrapper.user .message-bubble {
//           background: linear-gradient(135deg, var(--accent-blue), #1a73e8);
//           color: white;
//           border: none;
//         }

//         .message-bubble.error {
//           background: rgba(255, 86, 48, 0.15);
//           color: var(--accent-red);
//           border-color: rgba(255, 86, 48, 0.3);
//         }

//         .message-time {
//           font-size: 11px;
//           color: var(--text-muted);
//           margin-top: 6px;
//         }

//         .loading-indicator {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           color: var(--text-muted);
//           font-size: 14px;
//           padding: 12px 0;
//         }

//         .spin {
//           animation: spin 1.2s linear infinite;
//         }

//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to   { transform: rotate(360deg); }
//         }

//         .quick-prompts {
//           padding: 16px 24px;
//           border-top: 1px solid var(--border-primary);
//           background: var(--bg-secondary);
//         }

//         .quick-title {
//           font-size: 13px;
//           color: var(--text-muted);
//           margin: 0 0 12px;
//         }

//         .quick-grid {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 10px;
//         }

//         .quick-btn {
//           padding: 8px 14px;
//           border-radius: 10px;
//           border: 1px solid var(--border-primary);
//           background: var(--bg-card);
//           color: var(--text-secondary);
//           font-size: 13px;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           cursor: pointer;
//           transition: all 0.22s ease;
//         }

//         .quick-btn:hover {
//           background: var(--bg-card-hover);
//           border-color: var(--border-hover);
//           transform: translateY(-1px);
//         }

//         .chat-input-container {
//           padding: 16px 24px;
//           border-top: 1px solid var(--border-primary);
//           background: var(--bg-card);
//           display: flex;
//           gap: 12px;
//         }

//         .chat-input {
//           flex: 1;
//           padding: 14px 18px;
//           border-radius: 12px;
//           border: 1px solid var(--border-primary);
//           background: var(--bg-secondary);
//           color: var(--text-primary);
//           font-size: 15px;
//           outline: none;
//           transition: all 0.2s ease;
//         }

//         .chat-input:focus {
//           border-color: var(--accent-blue);
//           box-shadow: 0 0 0 3px rgba(38, 132, 255, 0.2);
//         }

//         .send-btn {
//           width: 52px;
//           height: 52px;
//           border-radius: 12px;
//           border: none;
//           background: var(--accent-blue);
//           color: white;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           transition: all 0.25s ease;
//         }

//         .send-btn:hover:not(.disabled) {
//           background: #1a73e8;
//           transform: scale(1.08);
//         }

//         .send-btn.disabled {
//           background: var(--border-secondary);
//           cursor: not-allowed;
//         }

//         @media (max-width: 480px) {
//           .chat-window {
//             bottom: 0;
//             right: 0;
//             width: 100%;
//             max-width: 100%;
//             height: 100vh;
//             max-height: 100vh;
//             border-radius: 0;
//           }

//           .chat-fab {
//             bottom: 20px;
//             right: 20px;
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default AIChatbot;
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Sparkles, TrendingUp, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const AIChatbot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name || 'there'}! 👋 I'm your AI task assistant. How can I help today?`,
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ── Quick Prompts ──
  const quickPrompts = [
    { icon: <TrendingUp size={16} />, text: "Task summary", query: "Give me a summary of my current tasks and status" },
    { icon: <Calendar size={16} />, text: "Deadlines", query: "What are my upcoming deadlines and overdue tasks?" },
    { icon: <CheckCircle size={16} />, text: "Progress", query: "Show progress across my active projects" },
    { icon: <AlertCircle size={16} />, text: "Overdue", query: "List all my overdue tasks with priorities" },
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
      const response = await fetch('http://localhost:8000/api/chat/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
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
          data: data.data,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again later.',
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
    // Small delay to let input update before sending
    setTimeout(() => handleSend(), 80);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-fab"
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window glass-card">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-avatar">
              <Sparkles size={24} />
            </div>
            <div>
              <h3>AI Task Assistant</h3>
              <p>Powered by your project data</p>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className={`message-bubble ${msg.isError ? 'error' : ''}`}>
                  {msg.content}
                </div>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="loading-indicator">
                <Loader className="spin" size={18} />
                <span>Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts - only at beginning */}
          {messages.length === 1 && (
            <div className="quick-prompts">
              <p className="quick-title">Quick actions:</p>
              <div className="quick-grid">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    className="quick-btn"
                    onClick={() => handleQuickPrompt(prompt.query)}
                  >
                    {prompt.icon}
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about tasks, deadlines, progress..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`send-btn ${!input.trim() || isLoading ? 'disabled' : ''}`}
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .chat-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--bg-navbar);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-lg);
          cursor: pointer;
          z-index: 1000;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .chat-fab:hover {
          transform: scale(1.12) translateY(-4px);
          box-shadow: 0 16px 48px rgba(38, 132, 255, 0.4);
        }

        .chat-window {
          position: fixed;
          bottom: 110px;
          right: 28px;
          width: 420px;
          max-width: calc(100vw - 56px);
          height: 640px;
          max-height: calc(100vh - 140px);
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 999;
          transition: all 0.3s ease;
        }

        .chat-header {
          background: var(--bg-navbar);
          padding: 20px 24px;
          color: white;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid var(--border-primary);
        }

        .chat-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .chat-header p {
          margin: 0;
          font-size: 13px;
          opacity: 0.9;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: var(--bg-secondary);
        }

        .message-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 82%;
        }

        .message-wrapper.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message-wrapper.assistant {
          align-self: flex-start;
          align-items: flex-start;
        }

        .message-bubble {
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 15px;
          line-height: 1.45;
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-secondary);
          position: relative;
        }

        .message-wrapper.user .message-bubble {
          background: linear-gradient(135deg, var(--accent-blue), #1a73e8);
          color: white;
          border: none;
        }

        .message-bubble.error {
          background: rgba(255, 86, 48, 0.15);
          color: var(--accent-red);
          border-color: rgba(255, 86, 48, 0.3);
        }

        .message-time {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 6px;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          font-size: 14px;
          padding: 12px 0;
        }

        .spin {
          animation: spin 1.2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .quick-prompts {
          padding: 16px 24px;
          border-top: 1px solid var(--border-primary);
          background: var(--bg-secondary);
        }

        .quick-title {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0 0 12px;
        }

        .quick-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .quick-btn {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid var(--border-primary);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.22s ease;
        }

        .quick-btn:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-hover);
          transform: translateY(-1px);
        }

        .chat-input-container {
          padding: 16px 24px;
          border-top: 1px solid var(--border-primary);
          background: var(--bg-card);
          display: flex;
          gap: 12px;
        }

        .chat-input {
          flex: 1;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 15px;
          outline: none;
          transition: all 0.2s ease;
        }

        .chat-input:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(38, 132, 255, 0.2);
        }

        .send-btn {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          border: none;
          background: var(--accent-blue);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .send-btn:hover:not(.disabled) {
          background: #1a73e8;
          transform: scale(1.08);
        }

        .send-btn.disabled {
          background: var(--border-secondary);
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .chat-window {
            bottom: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }

          .chat-fab {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default AIChatbot;