import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Hash, ChevronDown, Plus, Trash2, RefreshCw, Users } from 'lucide-react';
import { chatAPI } from '../../services/api';

export default function TeamChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);
  
  const chatEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const dropdownRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Click outside dropdown handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowChannelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch projects on mount
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  // Fetch channels when project changes
  useEffect(() => {
    if (currentProject) {
      fetchChannels(currentProject);
    }
  }, [currentProject]);

  // Fetch messages when channel changes
  useEffect(() => {
    if (currentChannel) {
      fetchMessages(currentChannel);
    }
  }, [currentChannel]);

  // Poll for new messages every 3 seconds when chat is open
  useEffect(() => {
    if (isOpen && currentChannel) {
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(currentChannel);
      }, 1000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [isOpen, currentChannel]);

  const fetchProjects = async () => {
    try {
      const data = await chatAPI.getUserProjects();
      setProjects(data.projects || []);
      
      // Auto-select first project if none selected
      if (!currentProject && data.projects && data.projects.length > 0) {
        setCurrentProject(data.projects[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchChannels = async (projectId) => {
    try {
      setLoading(true);
      const data = await chatAPI.getProjectChannels(projectId);
      setChannels(data.channels || []);
      
      // Auto-select first channel (usually "general")
      if (data.channels && data.channels.length > 0) {
        setCurrentChannel(data.channels[0].id);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId) => {
    try {
      const data = await chatAPI.getChannelMessages(channelId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentChannel || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      await chatAPI.sendMessage(currentChannel, messageText);
      // Immediately fetch new messages
      await fetchMessages(currentChannel);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !currentProject) return;

    try {
      await chatAPI.createChannel(currentProject, {
        name: newChannelName.toLowerCase().trim(),
        description: newChannelDesc.trim()
      });
      
      // Refresh channels
      await fetchChannels(currentProject);
      
      // Reset form
      setNewChannelName('');
      setNewChannelDesc('');
      setShowNewChannelForm(false);
    } catch (error) {
      console.error('Error creating channel:', error);
      alert(error.message || 'Failed to create channel');
    }
  };

  const handleDeleteChannel = async (channelId) => {
    if (!window.confirm('Are you sure you want to delete this channel? All messages will be lost.')) {
      return;
    }

    try {
      await chatAPI.deleteChannel(channelId);
      await fetchChannels(currentProject);
    } catch (error) {
      console.error('Error deleting channel:', error);
      alert(error.message || 'Failed to delete channel');
    }
  };

  const currentProjectData = projects.find(p => p.id === currentProject);
  const currentChannelData = channels.find(ch => ch.id === currentChannel);
  const totalUnread = projects.reduce((sum, p) => sum + (p.unread || 0), 0);

  return (
    <>
      {/* Floating Chat Button - LEFT BOTTOM */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="team-chat-btn"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px', // Changed from right to left
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <MessageCircle size={22} strokeWidth={2.5} />
          {totalUnread > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#ef4444',
              color: 'white',
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 5px',
              borderRadius: '10px',
              minWidth: '18px',
              textAlign: 'center',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
            }}>
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Chat Window - COMPACT & PROFESSIONAL */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px', // Changed from right to left
          width: '380px',
          height: '540px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {/* Header - COMPACT */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Project Dropdown - COMPACT */}
              <div style={{ position: 'relative', marginBottom: '4px' }} ref={dropdownRef}>
                <button
                  onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    width: '100%',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <Users size={13} />
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {currentProjectData?.name || 'Select Project'}
                    </span>
                  </div>
                  <ChevronDown size={14} />
                </button>

                {/* Dropdown Menu */}
                {showChannelDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    zIndex: 1001
                  }}>
                    {projects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setCurrentProject(project.id);
                          setShowChannelDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: 'none',
                          background: currentProject === project.id ? '#f3f4f6' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#1f2937',
                          fontSize: '13px',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          if (currentProject !== project.id) {
                            e.currentTarget.style.background = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentProject !== project.id) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: project.color,
                          flexShrink: 0
                        }} />
                        <span style={{
                          flex: 1,
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {project.name}
                        </span>
                        {project.unread > 0 && (
                          <span style={{
                            background: '#ef4444',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '600',
                            padding: '1px 5px',
                            borderRadius: '8px',
                            minWidth: '18px',
                            textAlign: 'center'
                          }}>
                            {project.unread}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Channel */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                opacity: 0.85,
                fontWeight: '500'
              }}>
                <Hash size={11} />
                <span>{currentChannelData?.name || 'general'}</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                marginLeft: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            >
              <X size={16} />
            </button>
          </div>

          {/* Main Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            minHeight: 0,
            background: '#fafafa'
          }}>
            {/* Sidebar - Channels - COMPACT */}
            <div style={{
              width: '110px',
              borderRight: '1px solid #e5e7eb',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Channels
                </span>
                {currentProjectData?.is_owner && (
                  <button
                    onClick={() => setShowNewChannelForm(!showNewChannelForm)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#667eea',
                      padding: '2px',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    title="Add Channel"
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Plus size={13} />
                  </button>
                )}
              </div>

              {/* New Channel Form - COMPACT */}
              {showNewChannelForm && (
                <div style={{
                  padding: '8px',
                  borderBottom: '1px solid #e5e7eb',
                  background: '#fafafa'
                }}>
                  <input
                    type="text"
                    placeholder="name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 6px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '11px',
                      marginBottom: '6px'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="desc"
                    value={newChannelDesc}
                    onChange={(e) => setNewChannelDesc(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 6px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '11px',
                      marginBottom: '6px'
                    }}
                  />
                  <button
                    onClick={handleCreateChannel}
                    disabled={!newChannelName.trim()}
                    style={{
                      width: '100%',
                      padding: '5px',
                      background: newChannelName.trim() ? '#667eea' : '#e5e7eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      cursor: newChannelName.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Create
                  </button>
                </div>
              )}

              {/* Channel List - COMPACT */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '6px'
              }}>
                {channels.map(channel => (
                  <div
                    key={channel.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      marginBottom: '2px'
                    }}
                  >
                    <button
                      onClick={() => setCurrentChannel(channel.id)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        border: 'none',
                        background: currentChannel === channel.id ? '#f3f4f6' : 'transparent',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        if (currentChannel !== channel.id) {
                          e.currentTarget.style.background = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentChannel !== channel.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <Hash size={10} style={{ color: '#9ca3af', flexShrink: 0 }} />
                      <span style={{
                        fontSize: '11px',
                        color: '#1f2937',
                        fontWeight: currentChannel === channel.id ? '600' : '400',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {channel.name}
                      </span>
                      {channel.unread > 0 && (
                        <span style={{
                          background: '#ef4444',
                          color: 'white',
                          fontSize: '8px',
                          fontWeight: '700',
                          padding: '1px 3px',
                          borderRadius: '6px',
                          minWidth: '12px',
                          textAlign: 'center'
                        }}>
                          {channel.unread}
                        </span>
                      )}
                    </button>
                    {currentProjectData?.is_owner && channel.name !== 'general' && (
                      <button
                        onClick={() => handleDeleteChannel(channel.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#ef4444',
                          padding: '3px',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.5,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.background = '#fee2e2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0.5';
                          e.currentTarget.style.background = 'transparent';
                        }}
                        title="Delete Channel"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Messages Area - COMPACT */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              background: '#ffffff'
            }}>
              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {loading ? (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontSize: '12px'
                  }}>
                    Loading...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: '#9ca3af',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <MessageCircle size={32} style={{ opacity: 0.3 }} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '2px' }}>
                        No messages yet
                      </div>
                      <div style={{ fontSize: '11px' }}>
                        Start the conversation!
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: msg.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '600',
                        flexShrink: 0
                      }}>
                        {msg.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '5px',
                          marginBottom: '2px'
                        }}>
                          <span style={{
                            fontWeight: '600',
                            fontSize: '12px',
                            color: '#1f2937'
                          }}>
                            {msg.user}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            color: '#9ca3af'
                          }}>
                            {new Date(msg.timestamp || msg.time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#374151',
                          lineHeight: '1.5',
                          wordWrap: 'break-word'
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input - COMPACT */}
              <div style={{
                padding: '10px',
                borderTop: '1px solid #e5e7eb',
                background: '#fafafa'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '6px',
                  background: '#ffffff',
                  borderRadius: '6px',
                  padding: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message #${currentChannelData?.name || 'channel'}`}
                    rows="1"
                    disabled={sending}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      resize: 'none',
                      fontSize: '12px',
                      color: '#1f2937',
                      fontFamily: 'inherit',
                      padding: '2px 0',
                      maxHeight: '60px',
                      overflowY: 'auto'
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                    style={{
                      background: message.trim() && !sending ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
                      border: 'none',
                      borderRadius: '5px',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: message.trim() && !sending ? 'pointer' : 'not-allowed',
                      color: 'white',
                      flexShrink: 0,
                      transition: 'all 0.2s'
                    }}
                  >
                    {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
                <div style={{
                  fontSize: '9px',
                  color: '#9ca3af',
                  marginTop: '4px',
                  textAlign: 'center'
                }}>
                  Press Enter to send
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        textarea:focus {
          outline: none;
        }
        .team-chat-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
        }
      `}</style>
    </>
  );
}