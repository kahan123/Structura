import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minus, Maximize2, Check, CheckCheck } from 'lucide-react';
import axios from '../api/axiosConfig';
import { useSocket } from '../context/SocketContext';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import { groupMessagesByDate } from '../utils/chatUtils';

const ChatWidget = () => {
    const { socket } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [adminId, setAdminId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const groupedMessages = groupMessagesByDate(messages);

    const toggleOpen = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isTyping]);

    // Init User & Find Admin
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) setCurrentUser(userInfo);

        const fetchAdmin = async () => {
            try {
                const { data } = await axios.get('/api/messages/admins');
                const admin = data.find(u => u.role === 'Admin');
                if (admin) setAdminId(admin._id);
            } catch (err) {
                console.error("Failed to fetch admin for widget", err);
            }
        };
        fetchAdmin();
    }, []);

    // Load History
    useEffect(() => {
        if (!isOpen || !currentUser || !adminId) return;

        const fetchHistory = async () => {
            try {
                const { data } = await axios.get(`/api/messages/${currentUser._id}/${adminId}`);
                setMessages(data);
                socket.emit('mark_read', { senderId: adminId, receiverId: currentUser._id });
            } catch (err) {
                console.error("Failed to load widget history", err);
            }
        };
        fetchHistory();
    }, [isOpen, currentUser, adminId, socket]);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleReceive = (msg) => {
            if (msg.sender === adminId || msg.receiver === adminId) {
                setMessages(prev => [...prev, msg]);
                if (isOpen) {
                    socket.emit('mark_read', { senderId: msg.sender, receiverId: currentUser?._id });
                }
            }
        };

        const handleTyping = (data) => {
            if (data.senderId === adminId) setIsTyping(data.isTyping);
        };

        const handleRead = (data) => {
            if (data.readerId === adminId) {
                setMessages(prev => prev.map(m => m.sender === currentUser?._id ? { ...m, isRead: true } : m));
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
    }, [socket, adminId, isOpen, currentUser]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !currentUser || !adminId) return;

        socket.emit('send_message', {
            senderId: currentUser._id,
            receiverId: adminId,
            text: inputValue
        });

        const optimistic = {
            _id: Date.now().toString(),
            sender: currentUser._id,
            receiver: adminId,
            text: inputValue,
            createdAt: new Date(),
            isRead: false
        };
        setMessages(prev => [...prev, optimistic]);
        setInputValue("");
        socket.emit('stop_typing', { senderId: currentUser._id, receiverId: adminId });
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (!socket || !adminId) return;

        socket.emit('typing', { senderId: currentUser?._id, receiverId: adminId });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { senderId: currentUser?._id, receiverId: adminId });
        }, 3000);
    };

    const containerRef = useRef(null);
    useGSAP(() => {
        gsap.fromTo('.widget-btn',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)', delay: 1 }
        );
    }, []);

    return (
        <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            <div
                className={`
                    bg-paper border border-secondary/20 shadow-2xl rounded-2xl overflow-hidden w-80 md:w-96 mb-4
                    transition-all duration-300 origin-bottom-right
                    ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none absolute bottom-0'}
                `}
                style={{ maxHeight: '500px', height: '60vh' }}
            >
                {/* Header */}
                <div className="bg-ink p-4 flex justify-between items-center text-paper">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-paper/20 flex items-center justify-center">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-ink rounded-full"></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Help Desk</h3>
                            <p className="text-[10px] opacity-70">Support Agent Online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={toggleOpen} className="p-1 hover:bg-paper/20 rounded transition-colors"><Minus className="w-4 h-4" /></button>
                        <button onClick={toggleOpen} className="p-1 hover:bg-paper/20 rounded transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Messages Body */}
                <div className="h-[calc(100%-110px)] overflow-y-auto p-4 bg-secondary/5 space-y-3 custom-scrollbar">
                    {groupedMessages.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            <div className="flex justify-center mb-2 mt-2">
                                <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {group.date}
                                </span>
                            </div>
                            {group.messages.map((msg) => (
                                <div key={msg._id} className={`flex ${msg.sender === currentUser?._id ? 'justify-end' : 'justify-start'} mb-2`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.sender === currentUser?._id
                                        ? 'bg-primary text-paper rounded-br-sm'
                                        : 'bg-paper text-ink border border-secondary/10 rounded-bl-sm'
                                        }`}>
                                        {msg.text}
                                        <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                                            <p className={`text-[8px] font-mono ${msg.sender === currentUser?._id ? 'text-paper' : 'text-secondary'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {msg.sender === currentUser?._id && (
                                                msg.isRead
                                                    ? <CheckCheck className="w-2.5 h-2.5 text-paper" />
                                                    : <Check className="w-2.5 h-2.5 text-paper/50" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-paper border border-secondary/10 rounded-2xl rounded-bl-none px-3 py-2 flex gap-1 items-center">
                                <div className="w-1 h-1 bg-secondary rounded-full animate-bounce" />
                                <div className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <form onSubmit={handleSend} className="h-[60px] border-t border-secondary/10 bg-paper p-2 flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="flex-1 bg-secondary/5 h-full rounded-full px-4 text-xs font-bold text-ink focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="h-10 w-10 bg-primary text-paper rounded-full flex items-center justify-center hover:bg-ink transition-colors disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleOpen}
                className={`widget-btn opacity-0
                    w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300
                    ${isOpen ? 'bg-secondary text-paper rotate-90 opacity-0 pointer-events-none absolute' : 'bg-primary text-paper hover:bg-ink hover:scale-110'}
                `}
            >
                <MessageCircle className="w-6 h-6" />
            </button>
        </div>
    );
};

export default ChatWidget;
