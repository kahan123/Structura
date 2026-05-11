import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { MessageSquare, X } from 'lucide-react';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        console.log("SocketContext: Initializing. UserInfo from localStorage:", userInfo);

        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log("Socket Connected:", newSocket.id);
        });

        // Join User Room if logged in
        if (userInfo && userInfo._id) {
            const roomName = `user_${userInfo._id}`;
            console.log(`[SocketContext] Requesting to join room: ${roomName}`);
            newSocket.emit('join_user', userInfo._id);
        }

        // Join Admin Room if admin
        if (userInfo && (userInfo.role === 'Admin' || userInfo.isAdmin)) {
            newSocket.emit('join_admin');
            console.log("[SocketContext] Joined Admin Room");
        }

        // --- Real-Time Message Notification Listener ---
        newSocket.on('receive_message', (msg) => {
            console.log("Global Socket notification received:", msg);
            
            const path = window.location.pathname;
            const isChatPage = path === '/chat' || path === '/admin/messages' || path === '/maintenance/messages';

            // Only show toast if the user is not actively on the corresponding chat page
            if (!isChatPage) {
                const newToast = {
                    id: Date.now(),
                    senderId: msg.sender,
                    senderName: msg.senderName || 'Someone',
                    senderRole: msg.senderRole || 'User',
                    text: msg.text,
                };
                setToasts(prev => [...prev, newToast]);

                // Auto-dismiss toast after 5 seconds
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== newToast.id));
                }, 5000);
            }
        });

        return () => {
            newSocket.off('receive_message');
            newSocket.close();
        };
    }, []);

    const joinRoom = (roomName) => {
        if (socket) {
            socket.emit('join_room', roomName);
        }
    };

    // Can be called after Login to join rooms immediately
    const registerUser = (user) => {
        if (!socket) return;

        console.log("SocketContext: Registering user", user);

        if (user._id) {
            socket.emit('join_user', user._id);
            console.log("Joined User Room:", user._id);
        }

        if (user.role === 'Admin' || user.isAdmin) {
            socket.emit('join_admin');
            console.log("Joined Admin Room");
        }
    };

    // Handle clicking a toast notification (takes user to correct chat)
    const handleToastClick = (toast) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        const role = (userInfo.role || '').toLowerCase();

        let redirectUrl = '/chat';
        if (role === 'admin') {
            redirectUrl = `/admin/messages?thread=${toast.senderId}`;
        } else if (role === 'maintenance') {
            redirectUrl = `/maintenance/messages?thread=${toast.senderId}`;
        } else {
            redirectUrl = `/chat?thread=${toast.senderId}`;
        }

        // Dismiss toast
        setToasts(prev => prev.filter(t => t.id !== toast.id));
        
        // Navigate
        window.location.href = redirectUrl;
    };

    return (
        <SocketContext.Provider value={{ socket, joinRoom, registerUser }}>
            {children}

            {/* --- Floating Global Notifications Portal --- */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        onClick={() => handleToastClick(toast)}
                        className="pointer-events-auto bg-[#f5f5f4] text-[#1c1917] border-2 border-[#d97706] rounded-xl p-4 shadow-[5px_5px_0px_0px_rgba(217,119,6,0.15)] flex gap-3 items-start cursor-pointer hover:translate-y-[-2px] hover:shadow-[5px_7px_0px_0px_rgba(217,119,6,0.2)] transition-all duration-300 animate-slide-in relative group overflow-hidden"
                        style={{ filter: 'url(#roughpaper)' }}
                    >
                        {/* Status bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#d97706]" />

                        {/* Icon */}
                        <div className="p-2 bg-[#ede8e4] text-[#d97706] rounded-lg mt-0.5">
                            <MessageSquare className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-baseline gap-1.5 mb-1">
                                <h4 className="text-xs font-bold text-[#1c1917] truncate">{toast.senderName}</h4>
                                <span className="text-[8px] font-mono font-bold bg-[#ede8e4] text-[#78716c] px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">
                                    {toast.senderRole}
                                </span>
                            </div>
                            <p className="text-xs text-[#78716c] font-medium leading-relaxed truncate">
                                {toast.text}
                            </p>
                        </div>

                        {/* Dismiss button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setToasts(prev => prev.filter(t => t.id !== toast.id));
                            }}
                            className="p-1 text-[#78716c]/40 hover:text-[#1c1917] rounded transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Injected SVG Filter to preserve hand-drawn look in Latte theme */}
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="roughpaper">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
                    </filter>
                </defs>
            </svg>
        </SocketContext.Provider>
    );
};
