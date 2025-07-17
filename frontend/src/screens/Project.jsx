import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer.js'


function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)
            ref.current.removeAttribute('data-highlighted')
        }
    }, [ props.className, props.children ])

    return <code {...props} ref={ref} />
}


const Project = () => {
    const location = useLocation()

    const [ isSidePanelOpen, setIsSidePanelOpen ] = useState(false)
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ selectedUserId, setSelectedUserId ] = useState(new Set())
    const [ project, setProject ] = useState(location.state.project)
    const [ message, setMessage ] = useState('')
    const { user } = useContext(UserContext)
    const messageBox = React.createRef()

    const [ users, setUsers ] = useState([])
    const [ messages, setMessages ] = useState([])
    const [ fileTree, setFileTree ] = useState({})

    const [ currentFile, setCurrentFile ] = useState(null)
    const [ openFiles, setOpenFiles ] = useState([])

    const [ webContainer, setWebContainer ] = useState(null)
    const [ iframeUrl, setIframeUrl ] = useState(null)

    const [ runProcess, setRunProcess ] = useState(null)

    const handleUserClick = (id) => {
        setSelectedUserId(prevSelectedUserId => {
            const newSelectedUserId = new Set(prevSelectedUserId);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            } else {
                newSelectedUserId.add(id);
            }
            return newSelectedUserId;
        });
    }

    function addCollaborators() {
        axios.put("/projects/add-user", {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(res => {
            console.log(res.data)
            setIsModalOpen(false)
        }).catch(err => {
            console.log(err)
        })
    }

    const send = () => {
        sendMessage('project-message', {
            message,
            sender: user
        })
        setMessages(prevMessages => [ ...prevMessages, { sender: user, message } ])
        setMessage("")
    }

    function WriteAiMessage(message) {
        const messageObject = JSON.parse(message)

        return (
            <div className='overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 text-green-400 rounded-lg p-4 border border-green-500/30 shadow-lg'>
                <Markdown
                    children={messageObject.text}
                    options={{
                        overrides: {
                            code: SyntaxHighlightedCode,
                        },
                    }}
                />
            </div>
        )
    }

    useEffect(() => {
        initializeSocket(project._id)

        if (!webContainer) {
            getWebContainer().then(container => {
                setWebContainer(container)
                console.log("container started")
            })
        }

        receiveMessage('project-message', data => {
            console.log(data)
            
            if (data.sender._id == 'ai') {
                const message = JSON.parse(data.message)
                console.log(message)
                webContainer?.mount(message.fileTree)

                if (message.fileTree) {
                    setFileTree(message.fileTree || {})
                }
                setMessages(prevMessages => [ ...prevMessages, data ])
            } else {
                setMessages(prevMessages => [ ...prevMessages, data ])
            }
        })

        axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {
            console.log(res.data.project)
            setProject(res.data.project)
            setFileTree(res.data.project.fileTree || {})
        })

        axios.get('/users/all').then(res => {
            setUsers(res.data.users)
        }).catch(err => {
            console.log(err)
        })
    }, [])

    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).then(res => {
            console.log(res.data)
        }).catch(err => {
            console.log(err)
        })
    }

    function scrollToBottom() {
        messageBox.current.scrollTop = messageBox.current.scrollHeight
    }

    return (
        <main className='h-screen w-screen flex bg-slate-950 text-white'>
            {/* Left Panel - Chat & Collaboration */}
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
                        {messages.map((msg, index) => (
                            <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-60'} ${msg.sender._id == user._id.toString() && 'ml-auto'} message flex flex-col p-3 rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg ${
                                msg.sender._id === 'ai' 
                                    ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-500/50' 
                                    : msg.sender._id == user._id.toString() 
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-500 border-blue-400/50' 
                                        : 'bg-gradient-to-br from-slate-600 to-slate-500 border-slate-400/50'
                            }`}>
                                <small className='opacity-70 text-xs font-medium text-slate-300'>{msg.sender.email}</small>
                                <div className='text-sm mt-1'>
                                    {msg.sender._id === 'ai' ?
                                        WriteAiMessage(msg.message)
                                        : <p className='text-white'>{msg.message}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message Input */}
                    <div className="inputField w-full flex border-t border-slate-700/50 bg-slate-800/50">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className='p-4 border-none outline-none flex-grow bg-transparent text-white placeholder-slate-400 focus:bg-slate-800/30 transition-all duration-200'
                            type="text" 
                            placeholder='Type your message...'
                            onKeyPress={(e) => e.key === 'Enter' && send()}
                        />
                        <button
                            onClick={send}
                            className='px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white transition-all duration-200 shadow-md hover:shadow-lg border-l border-green-400/30'
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

            {/* Right Panel - Code Editor */}
            <section className="right flex-grow h-full flex bg-slate-950">
                {/* File Explorer */}
                <div className="explorer h-full max-w-64 min-w-52 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50">
                    <div className="file-tree w-full">
                        <div className="p-3 bg-slate-700/50 border-b border-slate-600/50">
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Explorer</h3>
                        </div>
                        {Object.keys(fileTree).map((file, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentFile(file)
                                    setOpenFiles([ ...new Set([ ...openFiles, file ]) ])
                                }}
                                className={`tree-element cursor-pointer p-3 px-4 flex items-center gap-2 w-full transition-all duration-200 hover:bg-slate-700/50 border-l-2 ${
                                    currentFile === file 
                                        ? 'bg-slate-700/70 border-l-blue-500 text-blue-400' 
                                        : 'border-l-transparent text-slate-300 hover:text-white'
                                }`}
                            >
                                <i className="ri-file-code-line text-sm"></i>
                                <p className='font-medium text-sm'>{file}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Code Editor Area */}
                <div className="code-editor flex flex-col flex-grow h-full">
                    {/* Tabs and Actions */}
                    <div className="top flex justify-between w-full bg-slate-800 border-b border-slate-700/50">
                        <div className="files flex">
                            {openFiles.map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentFile(file)}
                                    className={`open-file cursor-pointer p-3 px-4 flex items-center gap-2 transition-all duration-200 border-r border-slate-700/50 hover:bg-slate-700/50 ${
                                        currentFile === file 
                                            ? 'bg-slate-700 text-white border-b-2 border-b-blue-500' 
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <i className="ri-file-code-line text-sm"></i>
                                    <p className='font-medium text-sm'>{file}</p>
                                </button>
                            ))}
                        </div>

                        <div className="actions flex gap-2 p-2">
                            <button
                                onClick={async () => {
                                    await webContainer.mount(fileTree)
                                    const installProcess = await webContainer.spawn("npm", [ "install" ])
                                    
                                    installProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    if (runProcess) {
                                        runProcess.kill()
                                    }

                                    let tempRunProcess = await webContainer.spawn("npm", [ "start" ]);
                                    tempRunProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    setRunProcess(tempRunProcess)

                                    webContainer.on('server-ready', (port, url) => {
                                        console.log(port, url)
                                        setIframeUrl(url)
                                    })
                                }}
                                className='px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-green-400/30 font-medium'
                            >
                                <i className="ri-play-fill mr-1"></i>
                                Run
                            </button>
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div className="bottom flex flex-grow max-w-full overflow-auto">
                        {fileTree[currentFile] && (
                            <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-900 border-r border-slate-700/50">
                                <pre className="hljs h-full bg-slate-900">
                                    <code
                                        className="hljs h-full outline-none text-slate-300 bg-slate-900"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => {
                                            const updatedContent = e.target.innerText;
                                            const ft = {
                                                ...fileTree,
                                                [ currentFile ]: {
                                                    file: {
                                                        contents: updatedContent
                                                    }
                                                }
                                            }
                                            setFileTree(ft)
                                            saveFileTree(ft)
                                        }}
                                        dangerouslySetInnerHTML={{ 
                                            __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value 
                                        }}
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            paddingBottom: '25rem',
                                            counterSet: 'line-numbering',
                                            padding: '1rem',
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                                        }}
                                    />
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Panel */}
                {iframeUrl && webContainer && (
                    <div className="flex min-w-96 flex-col h-full border-l border-slate-700/50">
                        <div className="address-bar bg-slate-800 border-b border-slate-700/50 p-2">
                            <div className="flex items-center gap-2">
                                <i className="ri-global-line text-slate-400"></i>
                                <input 
                                    type="text"
                                    onChange={(e) => setIframeUrl(e.target.value)}
                                    value={iframeUrl} 
                                    className="flex-grow p-2 bg-slate-700 text-white rounded-lg border border-slate-600/50 focus:border-blue-500/50 outline-none transition-all duration-200"
                                    placeholder="Enter URL..."
                                />
                            </div>
                        </div>
                        <iframe 
                            src={iframeUrl} 
                            className="w-full h-full bg-white"
                            title="Preview"
                        />
                    </div>
                )}
            </section>

            {/* Add Collaborator Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 rounded-xl w-96 max-w-full border border-slate-700/50 shadow-2xl">
                        <header className='flex justify-between items-center mb-6'>
                            <h2 className='text-xl font-bold text-white'>Add Collaborators</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className='p-2 hover:bg-slate-700 rounded-lg transition-all duration-200'
                            >
                                <i className="ri-close-fill text-slate-300"></i>
                            </button>
                        </header>
                        <div className="users-list flex flex-col gap-2 mb-6 max-h-80 overflow-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                            {users.map(user => (
                                <div 
                                    key={user.id} 
                                    className={`user cursor-pointer p-3 flex gap-3 items-center rounded-lg transition-all duration-200 border ${
                                        Array.from(selectedUserId).indexOf(user._id) !== -1 
                                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                                            : 'hover:bg-slate-700/50 border-slate-600/30 text-slate-300 hover:text-white'
                                    }`}
                                    onClick={() => handleUserClick(user._id)}
                                >
                                    <div className='aspect-square rounded-full w-10 h-10 flex items-center justify-center text-white bg-gradient-to-br from-slate-600 to-slate-500 shadow-md border border-slate-500/30'>
                                        <i className="ri-user-fill"></i>
                                    </div>
                                    <h1 className='font-semibold'>{user.email}</h1>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addCollaborators}
                            className='w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-blue-400/30'
                        >
                            Add Selected Collaborators
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project