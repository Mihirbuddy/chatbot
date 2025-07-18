import React from 'react'

const CollaboratorPanel = ({ isSidePanelOpen, setIsSidePanelOpen, project }) => (
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
      {project.users?.map((user, index) => (
        <div key={index} className="user cursor-pointer hover:bg-slate-700/50 p-3 flex gap-3 items-center rounded-lg transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50">
          <div className='aspect-square rounded-full w-10 h-10 flex items-center justify-center text-white bg-gradient-to-br from-blue-600 to-blue-500 shadow-md border border-blue-400/30'>
            <i className="ri-user-fill"></i>
          </div>
          <h1 className='font-semibold text-white'>{user.email}</h1>
        </div>
      ))}
    </div>
  </div>
)

export default CollaboratorPanel
