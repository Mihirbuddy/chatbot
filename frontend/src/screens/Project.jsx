// src/pages/Project.jsx
import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import { getWebContainer } from '../config/webContainer'
import hljs from 'highlight.js';

import Header from '../components/Header.jsx'
import ChatArea from '../components/ChatArea.jsx'
import CollaboratorPanel from '../components/CollaboratorPanel.jsx'
import CodeEditor from '../components/CodeEditor.jsx'
import AddCollaboratorPanel from '../components/AddCollaboratorPanel.jsx'

const Project = () => {
  const location = useLocation()
  const { user } = useContext(UserContext)
  const messageBox = useRef()

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

  const handleUserClick = (id) => {
    setSelectedUserId(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const addCollaborators = () => {
    axios.put("/projects/add-user", {
      projectId: project._id,
      users: Array.from(selectedUserId)
    }).then(() => setIsModalOpen(false))
  }

  const send = () => {
    sendMessage('project-message', { message, sender: user })
    setMessages(prev => [...prev, { sender: user, message }])
    setMessage("")
  }

  const saveFileTree = (ft) => {
    axios.put('/projects/update-file-tree', {
      projectId: project._id,
      fileTree: ft
    })
  }

  useEffect(() => {
    initializeSocket(project._id)

    if (!webContainer) {
      getWebContainer().then(setWebContainer)
    }

    receiveMessage('project-message', data => {
      if (data.sender._id === 'ai') {
        const message = JSON.parse(data.message)
        webContainer?.mount(message.fileTree)
        if (message.fileTree) setFileTree(message.fileTree)
      }
      setMessages(prev => [...prev, data])
    })

    axios.get(`/projects/get-project/${project._id}`).then(res => {
      setProject(res.data.project)
      setFileTree(res.data.project.fileTree || {})
    })

    axios.get('/users/all').then(res => setUsers(res.data.users))
  }, [])

  return (
    <main className='h-screen w-screen flex bg-slate-950 text-white'>
      <section className="left relative flex flex-col h-screen min-w-96 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50">
        <Header 
          setIsModalOpen={setIsModalOpen} 
          setIsSidePanelOpen={setIsSidePanelOpen} 
          isSidePanelOpen={isSidePanelOpen} 
        />
        <ChatArea 
          messages={messages} 
          message={message} 
          setMessage={setMessage} 
          send={send} 
          messageBox={messageBox} 
          user={user} 
        />
        <CollaboratorPanel 
          isSidePanelOpen={isSidePanelOpen} 
          setIsSidePanelOpen={setIsSidePanelOpen} 
          project={project} 
        />
      </section>
      <CodeEditor 
        fileTree={fileTree} 
        currentFile={currentFile} 
        setCurrentFile={setCurrentFile} 
        openFiles={openFiles} 
        setOpenFiles={setOpenFiles} 
        saveFileTree={saveFileTree} 
        webContainer={webContainer} 
        setIframeUrl={setIframeUrl} 
        runProcess={runProcess} 
        setRunProcess={setRunProcess} 
        iframeUrl={iframeUrl} 
      />
      <AddCollaboratorPanel 
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
