import React, { useRef, useEffect } from 'react'
import { sendMessage } from '../config/socket'
import { WriteAiMessage } from '../utils/messageUtils'

const ChatPanel = ({ 
    isSidePanelOpen, 
    setIsSidePanelOpen, 
    setIsModalOpen, 
    project, 
    messages, 
    setMessages, 
    message, 
    setMessage, 
    user 
}) => {
    const messageBox = useRef(null)

    // Function to fetch messages from API
    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token') // Adjust this based on how you store the token
            
            const response = await fetch(`http://localhost:8080/message/project/${project._id}`, {
                method: 'GET',
                headers: {
                    'projectId': project._id,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                // Assuming the API returns messages in data.messages or directly as data
                const fetchedMessages = data.messages || data
                setMessages(fetchedMessages)
            } else {
                console.error('Failed to fetch messages:', response.statusText)
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    }

    // Fetch messages when component mounts or project changes
    useEffect(() => {
        if (project && project._id) {
            fetchMessages()
        }
    }, [project._id])

    const send = () => {
        sendMessage('project-message', {
            message,
            sender: user
        })
        setMessages(prevMessages => [...prevMessages, { sender: user, message }])
        setMessage("")
    }

    const scrollToBottom = () => {
        if (messageBox.current) {
            messageBox.current.scrollTop = messageBox.current.scrollHeight
        }
    }

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <section className="left relative flex flex-col h-screen min-w-96 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50">
            {/* Header */}
            <header className='flex justify-between items-center p-4 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600/50 shadow-lg'>
                <button 
                    className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-blue-400/30'
                    onClick={() => setIsModalOpen(true)}
                >
                    <i className="ri-add-fill"></i>
                    <p className='font-medium'>Add Collaborator</p>
                </button>
                <button 
                    onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
                    className='p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 border border-slate-600/50 shadow-md'
                >
                    <i className="ri-group-fill text-slate-300"></i>
                </button>
            </header>

            {/* Chat Area */}
            <div className="conversation-area flex-grow flex flex-col h-full relative">
                <div
                    ref={messageBox}
                    className="message-box p-4 flex-grow flex flex-col gap-3 overflow-auto max-h-full scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
                >
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-60'} ${msg.sender._id == user._id.toString() && 'ml-auto'} message flex flex-col p-3 rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg ${
                                msg.sender._id === 'ai' 
                                    ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-500/50' 
                                    : msg.sender._id == user._id.toString() 
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-500 border-blue-400/50' 
                                        : 'bg-gradient-to-br from-slate-600 to-slate-500 border-slate-400/50'
                            }`}>
                                <small className='opacity-70 text-xs font-medium text-slate-300'>
                                    {msg.sender.email || msg.sender.name || 'Unknown User'}
                                </small>
                                <div className='text-sm mt-1'>
                                    {msg.sender._id === 'ai' ?
                                        <WriteAiMessage message={msg.message} />
                                        : <p className='text-white'>{msg.message}</p>}
                                </div>
                                {msg.timestamp && (
                                    <small className='opacity-50 text-xs mt-1 text-slate-400'>
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </small>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Message Input */}
                <div className="inputField w-full flex border-t border-slate-700/50 bg-slate-800/50">
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className='p-4 border-none outline-none flex-grow bg-transparent text-white placeholder-slate-400 focus:bg-slate-800/30 transition-all duration-200'
                        type="text" 
                        placeholder='Type your message...'
                        onKeyPress={(e) => e.key === 'Enter' && message.trim() && send()}
                    />
                    <button
                        onClick={send}
                        disabled={!message.trim()}
                        className='px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-md hover:shadow-lg border-l border-green-400/30'
                    >
                        <i className="ri-send-plane-fill"></i>
                    </button>
                </div>
            </div>

            {/* Collaborators Side Panel */}
            <div className={`sidePanel w-full h-full flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 absolute transition-all duration-300 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0 border-r border-slate-700/50 shadow-2xl`}>
                <header className='flex justify-between items-center px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600/50'>
                    <h1 className='font-bold text-lg text-white'>Collaborators</h1>
                    <button 
                        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
                        className='p-2 hover:bg-slate-600 rounded-lg transition-all duration-200'
                    >
                        <i className="ri-close-fill text-slate-300"></i>
                    </button>
                </header>
                <div className="users flex flex-col gap-2 p-4">
                    {project.users && project.users.map((user, index) => (
                        <div key={index} className="user cursor-pointer hover:bg-slate-700/50 p-3 flex gap-3 items-center rounded-lg transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50">
                            <div className='aspect-square rounded-full w-10 h-10 flex items-center justify-center text-white bg-gradient-to-br from-blue-600 to-blue-500 shadow-md border border-blue-400/30'>
                                <i className="ri-user-fill"></i>
                            </div>
                            <h1 className='font-semibold text-white'>{user.email}</h1>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ChatPanel