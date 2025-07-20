import React from 'react'

const CollaboratorModal = ({ 
    isModalOpen, 
    setIsModalOpen, 
    users, 
    selectedUserId, 
    handleUserClick, 
    addCollaborators 
}) => {
    if (!isModalOpen) return null

    return (
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
    )
}

export default CollaboratorModal