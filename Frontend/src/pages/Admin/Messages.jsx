import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, User, Search, ArrowLeft, Check, CheckCheck, Info, Mail, Shield, Smartphone, X } from 'lucide-react';
import axios from '../../api/axiosConfig';
import { useSocket } from '../../context/SocketContext';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import { groupMessagesByDate } from '../../utils/chatUtils';

const AdminMessages = () => {
    const [searchParams] = useSearchParams();
    const { socket } = useSocket();
    const initialThread = searchParams.get('thread');

    const [threads, setThreads] = useState([]);
    const [activeThread, setActiveThread] = useState(null);
    const [showMobileChat, setShowMobileChat] = useState(!!initialThread);
    const [showProfile, setShowProfile] = useState(false); // New Profile State
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [typingStatus, setTypingStatus] = useState({});

    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    const groupedMessages = groupMessagesByDate(messages);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingStatus]);

    // Init Admin & Fetch conversations
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        setCurrentUser(userInfo);

        const fetchThreads = async () => {
            try {
                const { data } = await axios.get(`/api/messages/conversations/${userInfo._id}`);
                setThreads(data.map(item => ({
                    id: item.user._id,
                    name: item.user.name,
                    email: item.user.email,
                    role: item.user.role,
                    lastMsg: item.lastMessage?.text || 'No messages',
                    time: new Date(item.lastMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })));

                if (initialThread) {
                    setActiveThread(initialThread);
                } else if (data.length > 0) {
                    setActiveThread(data[0].user._id);
                }
            } catch (err) {
                console.error("Failed to fetch threads", err);
            }
        };

        if (userInfo) fetchThreads();
    }, [initialThread]);

    // Load Chat History
    useEffect(() => {
        if (!currentUser || !activeThread) return;

        const fetchHistory = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`/api/messages/${currentUser._id}/${activeThread}`);
                setMessages(data);
                setLoading(false);
                socket.emit('mark_read', { senderId: activeThread, receiverId: currentUser._id });
            } catch (err) {
                console.error("Failed to fetch history", err);
                setLoading(false);
            }
        };

        fetchHistory();
    }, [currentUser, activeThread, socket]);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;

        const handleReceive = (msg) => {
            if (msg.sender === activeThread || msg.receiver === activeThread) {
                setMessages(prev => [...prev, msg]);
                socket.emit('mark_read', { senderId: msg.sender, receiverId: currentUser._id });
            }
            // Update threads list preview
            setThreads(prev => prev.map(t => t.id === msg.sender || t.id === msg.receiver
                ? { ...t, lastMsg: msg.text, time: 'Just now' } : t));
        };

        const handleTyping = (data) => {
            setTypingStatus(prev => ({ ...prev, [data.senderId]: data.isTyping }));
        };

        const handleRead = (data) => {
            if (data.readerId === activeThread) {
                setMessages(prev => prev.map(m => m.sender === currentUser._id ? { ...m, isRead: true } : m));
            }
        };

        socket.on('receive_message', handleReceive);
        socket.on('typing_status', handleTyping);
        socket.on('messages_read', handleRead);

        return () => {
            socket.off('receive_message', handleReceive);
            socket.off('typing_status', handleTyping);
            socket.off('messages_read', handleRead);
        };
    }, [socket, activeThread, currentUser]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !currentUser || !activeThread) return;

        socket.emit('send_message', {
            senderId: currentUser._id,
            receiverId: activeThread,
            text: messageInput
        });

        const optimistic = {
            _id: Date.now().toString(),
            sender: currentUser._id,
            receiver: activeThread,
            text: messageInput,
            createdAt: new Date(),
            isRead: false
        };
        setMessages(prev => [...prev, optimistic]);
        setMessageInput("");
        socket.emit('stop_typing', { senderId: currentUser._id, receiverId: activeThread });
    };

    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        if (!socket || !activeThread) return;

        socket.emit('typing', { senderId: currentUser._id, receiverId: activeThread });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { senderId: currentUser._id, receiverId: activeThread });
        }, 3000);
    };

    const activeThreadInfo = threads.find(t => t.id === activeThread);

    const containerRef = useRef(null);
    useGSAP(() => {
        gsap.fromTo('.thread-card',
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
        );
        gsap.fromTo('.chat-area',
            { opacity: 0, scale: 0.98 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 }
        );
    }, [threads.length]);

    return (
        <div ref={containerRef} className="h-[calc(100vh-100px)] flex gap-6">
            {/* Sidebar List */}
            <div className={`flex-shrink-0 bg-paper border border-secondary/10 rounded-lg shadow-sm flex flex-col overflow-hidden w-full md:w-80 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-secondary/10">
                    <h2 className="text-lg font-black text-ink uppercase tracking-tight mb-4">Admin Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                        <input type="text" placeholder="Search chats..." className="w-full bg-secondary/5 border border-secondary/10 rounded-full pl-9 pr-4 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-1 focus:ring-primary/20" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {threads.map(thread => (
                        <button
                            key={thread.id}
                            onClick={() => { setActiveThread(thread.id); setShowMobileChat(true); }}
                            className={`thread-card opacity-0 w-full p-4 flex items-center gap-3 transition-colors border-l-4 ${activeThread === thread.id ? 'bg-primary/5 border-primary' : 'hover:bg-secondary/5 border-transparent'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeThread === thread.id ? 'bg-primary text-white' : 'bg-secondary/10 text-secondary'}`}>
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className="text-sm font-bold text-ink truncate">{thread.name}</span>
                                    <span className="text-[10px] text-secondary/50 font-mono">{thread.time}</span>
                                </div>
                                <p className="text-[10px] text-secondary/70 truncate mb-1">{thread.email}</p>
                                <p className="text-xs text-secondary truncate font-medium">{thread.lastMsg}</p>
                            </div>
                        </button>
                    ))}
                    {threads.length === 0 && <div className="p-10 text-center text-xs text-secondary opacity-50 italic">No active conversations found.</div>}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`chat-area opacity-0 flex-1 bg-paper border border-secondary/10 rounded-lg shadow-sm flex flex-col overflow-hidden ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
                <div className="p-4 border-b border-secondary/10 flex justify-between items-center bg-secondary/5">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowMobileChat(false)} className="md:hidden p-2 -ml-2 text-secondary"><ArrowLeft className="w-5 h-5" /></button>
                        <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-ink uppercase tracking-wide">{activeThreadInfo?.name || 'Chat'}</h3>
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{activeThreadInfo?.role || 'User'}</span>
                        </div>
                    </div>
                    {/* Toggle Profile Button */}
                    <button onClick={() => setShowProfile(!showProfile)} className={`p-2 rounded-full transition-colors ${showProfile ? 'bg-primary text-paper' : 'text-secondary hover:bg-secondary/10'}`}>
                        <Info className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Messages Container */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-darker/50 custom-scrollbar">
                            {groupedMessages.map((group, groupIndex) => (
                                <div key={groupIndex}>
                                    <div className="flex justify-center mb-4 mt-2">
                                        <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            {group.date}
                                        </span>
                                    </div>
                                    {group.messages.map((msg) => (
                                        <div key={msg._id} className={`flex ${msg.sender === currentUser?._id ? 'justify-end' : 'justify-start'} mb-2`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === currentUser?._id ? 'bg-primary text-paper rounded-br-none' : 'bg-paper border border-secondary/10 rounded-bl-none'}`}>
                                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                                <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                                                    <p className={`text-[9px] font-mono ${msg.sender === currentUser?._id ? 'text-paper' : 'text-secondary'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {msg.sender === currentUser?._id && (
                                                        msg.isRead
                                                            ? <CheckCheck className="w-3 h-3 text-paper" />
                                                            : <Check className="w-3 h-3 text-paper/50" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            {typingStatus[activeThread] && (
                                <div className="flex justify-start">
                                    <div className="bg-paper border border-secondary/10 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
                                        <div className="w-1 h-1 bg-secondary rounded-full animate-bounce" />
                                        <div className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-secondary/10 bg-paper">
                            <div className="flex items-center gap-2 bg-secondary/5 rounded-full px-2 py-2 border border-secondary/10 focus-within:border-primary/30">
                                <input type="text" value={messageInput} onChange={handleInputChange} placeholder="Type a message..." className="flex-1 bg-transparent px-4 text-sm font-medium text-ink focus:outline-none" />
                                <button type="submit" disabled={!messageInput.trim()} className="p-2 bg-primary text-paper rounded-full hover:bg-ink transition-colors disabled:opacity-50"><Send className="w-4 h-4" /></button>
                            </div>
                        </form>
                    </div>

                    {/* Profile Panel (Right Side) */}
                    {showProfile && activeThreadInfo && (
                        <div className="w-72 bg-paper border-l border-secondary/10 flex flex-col items-center p-6 overflow-y-auto">
                            <button onClick={() => setShowProfile(false)} className="self-end mb-4 text-secondary hover:text-ink md:hidden"> {/* Mobile close */}
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center text-primary mb-4 ring-4 ring-paper shadow-lg">
                                <User className="w-10 h-10" />
                            </div>
                            <h2 className="text-lg font-black text-ink text-center mb-1">{activeThreadInfo.name}</h2>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                                {activeThreadInfo.role}
                            </span>

                            <div className="w-full space-y-4">
                                <div className="p-4 bg-secondary/5 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2 text-secondary">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Email</span>
                                    </div>
                                    <p className="text-sm font-medium text-ink break-all">{activeThreadInfo.email}</p>
                                </div>

                                <div className="p-4 bg-secondary/5 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2 text-secondary">
                                        <Shield className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">ID</span>
                                    </div>
                                    <p className="text-xs font-mono text-ink break-all">{activeThreadInfo.id}</p>
                                </div>
                                <div className="p-4 bg-secondary/5 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2 text-secondary">
                                        <Smartphone className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Status</span>
                                    </div>
                                    <p className="text-xs font-bold text-emerald-500">Active</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
