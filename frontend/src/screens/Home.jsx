import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const { user } = useContext(UserContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [projects, setProjects] = useState([])
    const [isCreating, setIsCreating] = useState(false)

    const navigate = useNavigate()

    // Function to fetch projects
    const fetchProjects = async () => {
        try {
            const res = await axios.get('/projects/all')
            setProjects(res.data.projects)
        } catch (err) {
            console.log(err)
        }
    }

    function createProject(e) {
        e.preventDefault()
        if (!projectName.trim()) return

        setIsCreating(true)

        axios.post('/projects/create', {
            name: projectName,
        })
        .then((res) => {
            console.log(res)
            setIsModalOpen(false)
            setProjectName('')
            setIsCreating(false)
            // Refresh projects list after creation
            fetchProjects()
        })
        .catch((error) => {
            console.log(error)
            setIsCreating(false)
        })
    }

    // Fetch projects on component mount
    useEffect(() => {
        fetchProjects()
    }, [])

    // Auto-refresh projects when modal closes (in case of external changes)
    useEffect(() => {
        if (!isModalOpen) {
            fetchProjects()
        }
    }, [isModalOpen])

    const handleLogout = () => {
    // Clear all local storage
    localStorage.clear();

    // Optionally redirect to login page (if using React Router)
    window.location.href = "/login"; // Or "/login" depending on your app
};

    return (
        <main className='min-h-screen bg-slate-950 text-white p-6'>
            {/* Header */}
            <header className='mb-8'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold text-white mb-2'>
                            Welcome back, {user?.email || 'Developer'}
                        </h1>
                        <p className='text-slate-400'>
                            Manage your projects and collaborate with your team
                        </p>
                    </div>
                    
                    <div className='flex items-center gap-4'>
                        
                        <div className='text-right'>
                            <p className='text-sm text-slate-400'>Total Projects</p>
                            <p className='text-2xl font-bold text-blue-400'>{projects.length}</p>
                        </div>
                        <button
    onClick={handleLogout}
    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-red-400/30 font-medium"
>
    Logout
</button>

                    </div>
                </div>
            </header>

            {/* Projects Grid */}
            <div className="projects-section">
                <div className="flex items-center justify-between mb-6">
                    <h2 className='text-xl font-semibold text-white'>Your Projects</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-blue-400/30 font-medium"
                    >
                        <i className="ri-add-fill"></i>
                        New Project
                    </button>
                </div>

                <div className="projects grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Create Project Card */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="project-card group h-40 p-6 border-2 border-dashed border-slate-600 hover:border-blue-500/50 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-3 hover:bg-slate-800/30"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-lg">
                            <i className="ri-add-fill text-white text-xl"></i>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                Create New Project
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Start building something amazing
                            </p>
                        </div>
                    </button>

                    {/* Project Cards */}
                    {projects.map((project) => (
                        <div 
                            key={project._id}
                            onClick={() => {
                                navigate(`/project`, {
                                    state: { project }
                                })
                            }}
                            className="project-card group cursor-pointer p-6 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-md">
                                    <i className="ri-folder-3-fill text-white"></i>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
                                    <i className="ri-arrow-right-line text-slate-400 group-hover:text-white"></i>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                                    {project.name}
                                </h3>
                                
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <i className="ri-team-fill"></i>
                                    <span>{project.users?.length || 0} collaborator{project.users?.length !== 1 ? 's' : ''}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <i className="ri-time-line"></i>
                                    <span>Last updated: {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {project.users?.slice(0, 3).map((user, index) => (
                                            <div 
                                                key={index}
                                                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 border-2 border-slate-800 flex items-center justify-center"
                                            >
                                                <i className="ri-user-fill text-white text-xs"></i>
                                            </div>
                                        ))}
                                        {project.users?.length > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center">
                                                <span className="text-xs text-white">+{project.users.length - 3}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">Project</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {projects.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center mx-auto mb-4">
                            <i className="ri-folder-open-line text-slate-400 text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
                        <p className="text-slate-400 mb-6">Create your first project to get started</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-blue-400/30 font-medium"
                        >
                            <i className="ri-add-fill mr-2"></i>
                            Create Your First Project
                        </button>
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-8 rounded-xl w-full max-w-md border border-slate-700/50 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Create New Project</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-all duration-200"
                            >
                                <i className="ri-close-fill text-slate-400"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={createProject} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Project Name
                                </label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text" 
                                    className="w-full p-3 bg-slate-700 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200" 
                                    placeholder="Enter project name..."
                                    required
                                    autoFocus
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-200 border border-slate-600/50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isCreating || !projectName.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-blue-400/30 font-medium disabled:cursor-not-allowed"
                                >
                                    {isCreating ? (
                                        <>
                                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-add-fill mr-2"></i>
                                            Create Project
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Home