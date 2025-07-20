import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage } from '../config/socket'
import { getWebContainer } from '../config/webContainer.js'
import ChatPanel from '../components/ChatPanel.jsx'
import CodeEditor from '../components/CodeEditor.jsx'
import CollaboratorModal from '../components/CollaboratorModal.jsx'

const Project = () => {
    const location = useLocation()
    const { user } = useContext(UserContext)

    // State management
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(new Set())
    const [project, setProject] = useState(location.state.project)
    const [message, setMessage] = useState('')
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [fileTree, setFileTree] = useState({})
    const [currentFile, setCurrentFile] = useState(null)
    const [openFiles, setOpenFiles] = useState([])
    const [webContainer, setWebContainer] = useState(null)
    const [iframeUrl, setIframeUrl] = useState(null)
    const [runProcess, setRunProcess] = useState(null)

    // Initialize socket and web container
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
                setMessages(prevMessages => [...prevMessages, data])
            } else {
                setMessages(prevMessages => [...prevMessages, data])
            }
        })

        // Fetch project data
        axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {
            console.log(res.data.project)
            setProject(res.data.project)
            setFileTree(res.data.project.fileTree || {})
        })

        // Fetch all users
        axios.get('/users/all').then(res => {
            setUsers(res.data.users)
        }).catch(err => {
            console.log(err)
        })
    }, [])

    // Save file tree to backend
    const saveFileTree = (ft) => {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).then(res => {
            console.log(res.data)
        }).catch(err => {
            console.log(err)
        })
    }

    // Add collaborators
    const addCollaborators = () => {
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

    // Handle user selection for collaboration
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

    return (
        <main className='h-screen w-screen flex bg-slate-950 text-white'>
            <ChatPanel 
                isSidePanelOpen={isSidePanelOpen}
                setIsSidePanelOpen={setIsSidePanelOpen}
                setIsModalOpen={setIsModalOpen}
                project={project}
                messages={messages}
                setMessages={setMessages}
                message={message}
                setMessage={setMessage}
                user={user}
            />

            <CodeEditor 
                fileTree={fileTree}
                setFileTree={setFileTree}
                currentFile={currentFile}
                setCurrentFile={setCurrentFile}
                openFiles={openFiles}
                setOpenFiles={setOpenFiles}
                webContainer={webContainer}
                iframeUrl={iframeUrl}
                setIframeUrl={setIframeUrl}
                runProcess={runProcess}
                setRunProcess={setRunProcess}
                saveFileTree={saveFileTree}
            />

            <CollaboratorModal 
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                users={users}
                selectedUserId={selectedUserId}
                handleUserClick={handleUserClick}
                addCollaborators={addCollaborators}
            />
        </main>
    )
}

export default Project