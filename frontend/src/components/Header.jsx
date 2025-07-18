import React from 'react'

const Header = ({ setIsModalOpen, setIsSidePanelOpen, isSidePanelOpen }) => (
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
)

export default Header
