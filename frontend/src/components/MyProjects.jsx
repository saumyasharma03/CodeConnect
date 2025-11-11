import { useEffect, useState } from "react";
import {
  FolderIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import Navbar from './Navbar'; // Adjust the path as needed

export default function MyProjects() {
    const [owned, setOwned] = useState([]);
    const [contributed, setContributed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOwned, setFilteredOwned] = useState([]);
    const [filteredContributed, setFilteredContributed] = useState([]);

    const token = JSON.parse(localStorage.getItem("user"))?.token;

    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch("/api/project/myprojects", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                const data = await res.json();
                const userData = JSON.parse(localStorage.getItem("user"));
                const userId = userData?._id; 

                const ownedProjects = data.filter(p => p.owner._id === userId);
                const contributedProjects = data.filter(p => p.contributors.some(c => c._id === userId));

                setOwned(ownedProjects);
                setContributed(contributedProjects);
                setFilteredOwned(ownedProjects);
                setFilteredContributed(contributedProjects);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, [token]);

    useEffect(() => {
        const filteredOwned = owned.filter(project =>
            project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.language?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const filteredContributed = contributed.filter(project =>
            project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.language?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setFilteredOwned(filteredOwned);
        setFilteredContributed(filteredContributed);
    }, [searchTerm, owned, contributed]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const getLanguageColor = (language) => {
        const colors = {
            cpp: 'bg-blue-500',
            python: 'bg-yellow-500',
            javascript: 'bg-yellow-400',
            java: 'bg-red-500',
            typescript: 'bg-blue-600',
            html: 'bg-orange-500',
            css: 'bg-blue-400',
            php: 'bg-purple-500',
            ruby: 'bg-red-600',
            go: 'bg-cyan-500',
            rust: 'bg-orange-600',
        };
        return colors[language] || 'bg-gray-500';
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <Navbar />
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading your projects...</p>
            </div>
        </div>
    );

    const totalProjects = owned.length + contributed.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6 pt-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <FolderIcon className="h-8 w-8 text-blue-400" />
                            <h1 className="text-2xl font-bold">My Projects</h1>
                        </div>
                        <div className="text-sm text-gray-400">
                            {totalProjects} project{totalProjects !== 1 ? 's' : ''}
                        </div>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                        />
                    </div>
                </div>

                {owned.length === 0 && contributed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <FolderIcon className="h-16 w-16 mb-4" />
                        <p className="text-lg mb-2">No projects yet</p>
                        <p className="text-sm text-gray-400 text-center max-w-md">
                            Create your first project or get invited to collaborate on existing ones.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Owned Projects Section */}
                        {filteredOwned.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <UserIcon className="h-5 w-5 text-blue-400" />
                                    <h2 className="text-xl font-semibold">Owned by me</h2>
                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                                        {filteredOwned.length}
                                    </span>
                                </div>
                                <div className="grid gap-3">
                                    {filteredOwned.map((project) => (
                                        <ProjectCard 
                                            key={project._id} 
                                            project={project} 
                                            formatDate={formatDate}
                                            getLanguageColor={getLanguageColor}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contributed Projects Section */}
                        {filteredContributed.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <CodeBracketIcon className="h-5 w-5 text-green-400" />
                                    <h2 className="text-xl font-semibold">Shared with me</h2>
                                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                                        {filteredContributed.length}
                                    </span>
                                </div>
                                <div className="grid gap-3">
                                    {filteredContributed.map((project) => (
                                        <ProjectCard 
                                            key={project._id} 
                                            project={project} 
                                            formatDate={formatDate}
                                            getLanguageColor={getLanguageColor}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No results message */}
                        {searchTerm && filteredOwned.length === 0 && filteredContributed.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                                <MagnifyingGlassIcon className="h-8 w-8 mb-2" />
                                <p className="text-sm">No projects found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ProjectCard({ project, formatDate, getLanguageColor }) {
    return (
        <div 
            className="border border-gray-700 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-gray-600"
            onClick={() => (window.location.href = `/editor/${project._id}`)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate mb-1">
                        {project.title}
                    </h3>
                    {project.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                            {project.description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs text-gray-400 capitalize">
                        {project.language}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${getLanguageColor(project.language)}`}></span>
                </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>{formatDate(project.updatedAt || project.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                    {project.owner && (
                        <span className="text-gray-400">
                            by {project.owner.name || project.owner.email}
                        </span>
                    )}
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        Open
                    </span>
                </div>
            </div>
        </div>
    );
}