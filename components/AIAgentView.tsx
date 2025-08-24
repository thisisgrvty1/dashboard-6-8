import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { GoogleGenAI, Chat } from '@google/genai';
import { Bot, Trash2, Send, ArrowLeft, Plus, MessageSquare, Edit3, Sparkles, Code, BookOpen, Mic } from 'lucide-react';
import type { ChatSession, AIAgentMessage } from '../types';
import AIAgentBackground from './backgrounds/AIAgentBackground';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useTranslations } from '../hooks/useTranslations';

interface AIAgentViewProps {
  geminiApiKey: string;
  sessions: ChatSession[];
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  onSaveSession?: (session: ChatSession) => Promise<void>;
}

const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
     transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};


const AIAgentView: React.FC<AIAgentViewProps> = ({ geminiApiKey, sessions, setSessions, onSaveSession }) => {
  const { t } = useTranslations();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

  const personas = useMemo(() => [
    {
        name: t('persona_helpful_assistant_name'),
        description: t('persona_helpful_assistant_desc'),
        icon: Sparkles,
        systemInstruction: t('persona_helpful_assistant_instruction')
    },
    {
        name: t('persona_creative_writer_name'),
        description: t('persona_creative_writer_desc'),
        icon: BookOpen,
        systemInstruction: t('persona_creative_writer_instruction')
    },
    {
        name: t('persona_code_wizard_name'),
        description: t('persona_code_wizard_desc'),
        icon: Code,
        systemInstruction: t('persona_code_wizard_instruction')
    },
    {
        name: t('persona_sarcastic_bot_name'),
        description: t('persona_sarcastic_bot_desc'),
        icon: Mic,
        systemInstruction: t('persona_sarcastic_bot_instruction')
    }
  ], [t]);
  
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [sessions]);

  const handleCreateNewSession = (persona: typeof personas[0]) => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: `${persona.name} Chat`,
      messages: [
        {
          id: 'init-msg',
          sender: 'model',
          text: t('chat_interface_initial_message'),
        },
      ],
      lastUpdated: new Date().toISOString(),
      personaName: persona.name,
      systemInstruction: persona.systemInstruction,
    };
    setSessions(prev => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
    setIsPersonaModalOpen(false);
  };
  
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (window.confirm(t('agent_delete_confirm'))) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
      }
    }
  };
  
  const handleRenameSession = (e: React.MouseEvent, sessionId: string) => {
      e.stopPropagation();
      const currentSession = sessions.find(s => s.id === sessionId);
      const newTitle = prompt(t('agent_rename_prompt'), currentSession?.title);
      if (newTitle && newTitle.trim() !== '') {
          setSessions(prev => prev.map(s => s.id === sessionId ? {...s, title: newTitle.trim()} : s));
      }
  }

  const handleClearAllSessions = () => {
    if (window.confirm(t('agent_clear_all_confirm'))) {
        setSessions([]);
        setSelectedSessionId(null);
    }
  };

  const updateSessionMessages = (sessionId: string, newMessages: AIAgentMessage[]) => {
    setSessions(prev => 
      prev.map(s => 
        s.id === sessionId 
          ? { ...s, messages: newMessages, lastUpdated: new Date().toISOString() } 
          : s
      )
    );
    
    // Save to database if available
    if (onSaveSession) {
      const updatedSession = sessions.find(s => s.id === sessionId);
      if (updatedSession) {
        const sessionToSave = { ...updatedSession, messages: newMessages, lastUpdated: new Date().toISOString() };
        onSaveSession(sessionToSave).catch(error => {
          console.error('Failed to save session to database:', error);
        });
      }
    }
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  if (selectedSession) {
    return (
      <motion.div
        key={`session-view-${selectedSession.id}`}
        variants={pageContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <ChatInterface 
          session={selectedSession}
          geminiApiKey={geminiApiKey}
          onBack={() => setSelectedSessionId(null)}
          updateMessages={updateSessionMessages}
          onSaveSession={onSaveSession}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="ai-agent-list-view"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative isolate module-ai_agent ai-agent-view"
    >
      {isPersonaModalOpen && (
        <PersonaSelectionModal 
            onClose={() => setIsPersonaModalOpen(false)}
            onSelectPersona={handleCreateNewSession}
            personas={personas}
        />
      )}
      <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden blur-[120px] opacity-20 dark:opacity-30">
        <AIAgentBackground />
      </div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4 ai-agent-header">
        <h2 className="font-display text-4xl font-bold text-indigo-600 dark:text-indigo-400">{t('agent_title')}</h2>
        <div className="flex items-center space-x-2">
           {sessions.length > 0 && (
            <button
              onClick={handleClearAllSessions}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>{t('agent_clear_all')}</span>
            </button>
          )}
          <button
            onClick={() => setIsPersonaModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center space-x-2 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          >
            <Plus size={20} />
            <span>{t('agent_new_chat')}</span>
          </button>
        </div>
      </div>
      
      {sortedSessions.length === 0 ? (
         <div className="text-center py-20 px-6 bg-white/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl">
           <MessageSquare className="mx-auto h-16 w-16 text-slate-400 dark:text-gray-600" />
          <h3 className="mt-4 font-display text-2xl font-semibold text-slate-800 dark:text-white">{t('agent_empty_title')}</h3>
          <p className="mt-2 text-slate-600 dark:text-gray-400">{t('agent_empty_desc')}</p>
        </div>
      ) : (
      <div className="space-y-4 session-list-container">
        {sortedSessions.map(session => (
          <div 
            key={session.id}
            onClick={() => setSelectedSessionId(session.id)}
            className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-lg p-4 flex items-center justify-between cursor-pointer group hover:bg-slate-50 dark:hover:bg-[#181818] hover:border-indigo-500/50 transition-colors session-list-item"
          >
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{session.title}</h3>
               <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full inline-block mt-2">{session.personaName}</p>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">
                {session.messages.length} {t('agent_messages_label')} | {t('agent_last_updated_label')} {new Date(session.lastUpdated).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => handleRenameSession(e, session.id)} 
                    className="p-2 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                    aria-label="Rename session"
                >
                    <Edit3 size={16} />
                </button>
                <button 
                    onClick={(e) => handleDeleteSession(e, session.id)} 
                    className="p-2 text-slate-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                    aria-label="Delete session"
                >
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </motion.div>
  );
};


interface ChatInterfaceProps {
    session: ChatSession;
    geminiApiKey: string;
    onBack: () => void;
    updateMessages: (sessionId: string, newMessages: AIAgentMessage[]) => void;
  onSaveSession?: (session: ChatSession) => Promise<void>;
}
const ChatInterface: React.FC<ChatInterfaceProps> = ({ session, geminiApiKey, onBack, updateMessages, onSaveSession }) => {
  const { t } = useTranslations();
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
    
  useEffect(() => {
    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const chatSession = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: { 
            systemInstruction: session.systemInstruction,
            ...session.config 
          },
          history: session.messages.slice(1).map(m => ({ // Exclude initial message
            role: m.sender, 
            parts: [{ text: m.text }]
          })),
        });
        setChat(chatSession);
        setError(null);
      } catch (e) {
        setError(t('chat_interface_init_error'));
        console.error(e);
      }
    } else {
      setError(t('error_gemini_api_key_not_set'));
    }
  }, [geminiApiKey, session.id, session.systemInstruction, session.config, session.messages, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading || !chat) return;

    const userMessage: AIAgentMessage = { id: `msg-${Date.now()}`, sender: 'user', text: input };
    const newMessages = [...session.messages, userMessage];
    updateMessages(session.id, newMessages);
    
    // Save session after user message
    if (onSaveSession) {
      const updatedSession = { ...session, messages: newMessages, lastUpdated: new Date().toISOString() };
      onSaveSession(updatedSession).catch(error => {
        console.error('Failed to save session after user message:', error);
      });
    }
    
    setInput('');
    setIsLoading(true);
    
    const modelMessageId = `msg-${Date.now() + 1}`;
    
    try {
      const result = await chat.sendMessageStream({ message: input });
      let text = '';
      updateMessages(session.id, [...newMessages, { id: modelMessageId, sender: 'model', text: '' }]);
      
      for await (const chunk of result) {
        text += chunk.text;
        updateMessages(session.id, [...newMessages, { id: modelMessageId, sender: 'model', text }]);
      }
      
      // Save session after model response
      if (onSaveSession) {
        const finalSession = { ...session, messages: [...newMessages, { id: modelMessageId, sender: 'model', text }], lastUpdated: new Date().toISOString() };
        onSaveSession(finalSession).catch(error => {
          console.error('Failed to save session after model response:', error);
        });
      }
    } catch (e) {
      const errorText = e instanceof Error ? e.message : 'An unknown error occurred.';
      const errorMessage : AIAgentMessage = { id: modelMessageId, sender: 'model', text: `Error: ${errorText}` }
      updateMessages(session.id, [...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden ai-chat-interface">
      <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between chat-interface-header">
         <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-full transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white truncate">{session.title}</h2>
            <p className="text-xs text-slate-500 dark:text-gray-500">
              {t('chat_interface_persona_label')} {session.personaName}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4 chat-messages-area">
        {session.messages.map((message) => (
          <div key={message.id} className={`flex items-start space-x-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.sender === 'model' && <div className="w-8 h-8 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full flex-shrink-0 flex items-center justify-center"><Bot size={18} className="text-indigo-600 dark:text-indigo-300"/></div>}
            <div className={`max-w-prose p-3 rounded-lg ${message.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-[#181818] text-slate-800 dark:text-gray-200'}`}>
              {message.sender === 'user' ? (
                <pre className="whitespace-pre-wrap font-sans text-sm">{message.text}</pre>
              ) : (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none leading-normal"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(message.text || '...') as string) }}
                />
              )}
            </div>
          </div>
        ))}
         {isLoading && session.messages[session.messages.length - 1]?.sender === 'user' && (
           <div className="flex items-start space-x-3 justify-start">
             <div className="w-8 h-8 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full flex-shrink-0 flex items-center justify-center"><Bot size={18} className="text-indigo-600 dark:text-indigo-300"/></div>
             <div className="max-w-xs lg:max-w-md p-3 rounded-lg bg-slate-100 dark:bg-[#181818] text-slate-800 dark:text-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500 animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500 animate-pulse [animation-delay:0.4s]"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-white/10 chat-input-form-container">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={error ? error : t('chat_interface_placeholder')}
            disabled={isLoading || !!error}
            className="w-full px-4 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-full text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !!error}
            className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-900/50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Persona = { name: string; description: string; icon: React.FC<any>; systemInstruction: string; };

interface PersonaSelectionModalProps {
    onClose: () => void;
    onSelectPersona: (persona: Persona) => void;
    personas: Persona[];
}

const PersonaSelectionModal: React.FC<PersonaSelectionModalProps> = ({ onClose, onSelectPersona, personas }) => {
    const { t } = useTranslations();
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopImmediatePropagation();
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-100 dark:bg-[#101010] border border-slate-300 dark:border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
                <h2 className="font-display text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t('persona_modal_title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personas.map(p => (
                        <div key={p.name} onClick={() => onSelectPersona(p)} className="bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 rounded-lg p-4 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-[#202020] transition-all duration-200">
                           <div className="flex items-center space-x-3">
                               <p.icon size={24} className="text-indigo-500 dark:text-indigo-400"/>
                               <h3 className="font-semibold text-slate-800 dark:text-white">{p.name}</h3>
                           </div>
                           <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">{p.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AIAgentView;