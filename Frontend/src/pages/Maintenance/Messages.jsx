import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, User, Search, Shield, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import axios from '../../api/axiosConfig';
import { useSocket } from '../../context/SocketContext';
import { groupMessagesByDate } from '../../utils/chatUtils';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const MaintenanceMessages = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialThread = searchParams.get('thread');
    const { socket } = useSocket();

    const [activeThread, setActiveThread] = useState(initialThread || 'admin');
    const [showMobileChat, setShowMobileChat] = useState(!!initialThread);
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    const groupedMessages = groupMessagesByDate(messages);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Initialize User & Fetch Admins
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }
        setCurrentUser(userInfo);

        const fetchAdmins = async () => {
            try {
                const { data } = await axios.get('/api/messages/admins');
                const adminList = data.filter(u => u.role === 'Admin');
                setAdmins(adminList);
                if (!initialThread && adminList.length > 0) {
                    setActiveThread(adminList[0]._id);
                }
            } catch (err) {
                console.error("Failed to fetch admins", err);
            }
        };

        fetchAdmins();
    }, [navigate, initialThread]);

    // Load Chat History
    useEffect(() => {
        if (!currentUser || !activeThread || activeThread === 'admin') return;

        const fetchHistory = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`/api/messages/${currentUser._id}/${activeThread}`);
                setMessages(data);
                setLoading(false);

                // Mark as read on load
                socket.emit('mark_read', { senderId: activeThread, receiverId: currentUser._id });
            } catch (err) {
                console.error("Failed to fetch messages", err);
                setLoading(false);
            }
        };

        fetchHistory();
    }, [currentUser, activeThread, socket]);

    // Socket Event Listeners
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (msg) => {
            if (msg.sender === activeThread || msg.receiver === activeThread) {
                setMessages(prev => [...prev, msg]);
                // If we are looking at the chat, mark as read immediately
                socket.emit('mark_read', { senderId: msg.sender, receiverId: currentUser._id });
            }
        };

        const handleTyping = (data) => {
            if (data.senderId === activeThread) {
                setIsTyping(data.isTyping);
            }
        };

        const handleReadUpdate = (data) => {
            if (data.readerId === activeThread) {
                setMessages(prev => prev.map(m => m.sender === currentUser._id ? { ...m, isRead: true } : m));
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('typing_status', handleTyping);
        socket.on('messages_read', handleReadUpdate);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('typing_status', handleTyping);
            socket.off('messages_read', handleReadUpdate);
        };
    }, [socket, activeThread, currentUser]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !currentUser || !activeThread) return;

        const payload = {
            senderId: currentUser._id,
            receiverId: activeThread,
            text: messageInput
        };

        // Emit via socket
        socket.emit('send_message', payload);

        // Optimistic update
        const optimisticMsg = {
            _id: Date.now().toString(),
            sender: currentUser._id,
            receiver: activeThread,
            text: messageInput,
            createdAt: new Date(),
            isRead: false
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setMessageInput("");

        // Stop typing
        socket.emit('stop_typing', { senderId: currentUser._id, receiverId: activeThread });
    };

    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        if (!socket || !activeThread) return;

        // Emit typing
        socket.emit('typing', { senderId: currentUser._id, receiverId: activeThread });

        // Debounce stop_typing
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { senderId: currentUser._id, receiverId: activeThread });
        }, 3000);
    };

    const activeThreadInfo = admins.find(a => a._id === activeThread) || { name: 'Admin Dispatch', role: 'Head Office' };

    const containerRef = useRef(null);
    useGSAP(() => {
        gsap.fromTo('.thread-btn',
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
        );
        gsap.fromTo('.chat-interface',
            { opacity: 0, scale: 0.98 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 }
        );
    }, [admins.length]);

    return (
        <div ref={containerRef} className="h-[calc(100vh-170px)] md:h-[calc(100vh-140px)] flex gap-6">
            {/* Sidebar List */}
            <div className={`flex-shrink-0 bg-paper border border-secondary/10 rounded-lg shadow-sm flex flex-col overflow-hidden w-full md:w-80 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-secondary/10">
                    <h2 className="text-lg font-black text-ink uppercase tracking-tight mb-4">Staff Chat</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                        <input type="text" placeholder="Search admins..." className="w-full bg-secondary/5 border border-secondary/10 rounded-full pl-9 pr-4 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-1 focus:ring-primary/20" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {admins.map(admin => (
                        <button
                            key={admin._id}
                            onClick={() => { setActiveThread(admin._id); setShowMobileChat(true); }}
                            className={`thread-btn opacity-0 w-full p-4 flex items-center gap-3 transition-colors border-l-4 ${activeThread === admin._id ? 'bg-primary/5 border-primary' : 'hover:bg-secondary/5 border-transparent'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeThread === admin._id ? 'bg-primary text-white' : 'bg-secondary/10 text-secondary'}`}>
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <span className="text-sm font-bold text-ink truncate block">{admin.name}</span>
                                <span className="text-[10px] text-secondary/50 font-mono uppercase tracking-tighter">{admin.role}</span>
                            </div>
                        </button>
                    ))}
                    {admins.length === 0 && <div className="p-10 text-center text-xs text-secondary opacity-50">Searching for available agents...</div>}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`chat-interface opacity-0 flex-1 bg-paper border border-secondary/10 rounded-lg shadow-sm flex flex-col overflow-hidden ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
                {/* Chat Header */}
                <div className="p-4 border-b border-secondary/10 flex justify-between items-center bg-secondary/5">
                    <div className="flex items-center gap-2 md:gap-3">
                        <button onClick={() => setShowMobileChat(false)} className="md:hidden p-2 -ml-2 text-secondary hover:text-ink"><ArrowLeft className="w-5 h-5" /></button>
                        <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-black text-ink uppercase tracking-wide truncate">{activeThreadInfo?.name}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-500 animate-pulse`} />
                                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider truncate">HEAD OFFICE ONLINE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-darker/50 custom-scrollbar">
                    {groupedMessages.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            <div className="flex justify-center mb-4 mt-2">
                                <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {group.date}
                                </span>
                            </div>
                            {group.messages.map((msg) => (
                                <div key={msg._id} className={`flex ${msg.sender === currentUser?._id ? 'justify-end' : 'justify-start'} mb-2`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === currentUser?._id ? 'bg-primary text-paper rounded-br-none' : 'bg-paper border border-secondary/10 rounded-bl-none'}`}>
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

                    {isTyping && (
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

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-secondary/10 bg-paper">
                    <div className="flex items-center gap-2 bg-secondary/5 rounded-full px-2 py-2 border border-secondary/10 focus-within:border-primary/30 focus-within:bg-paper transition-all">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={handleInputChange}
                            placeholder="Type a message to Admin..."
                            className="flex-1 bg-transparent px-4 text-sm font-medium text-ink focus:outline-none placeholder:text-secondary/30 min-w-0"
                        />
                        <button type="submit" disabled={!messageInput.trim()} className="p-2 bg-primary text-paper rounded-full hover:bg-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MaintenanceMessages;
