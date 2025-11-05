import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Editor from './Editor';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  TrashIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_API || 'http://localhost:5000/api';

export default function Home() {
  const [snippets, setSnippets] = useState([]);
  const [activeSnippet, setActiveSnippet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSnippets, setFilteredSnippets] = useState([]);

  const fetchSnippets = async () => {
    try {
      const res = await axios.get(`${API}/snippets`);
      setSnippets(res.data);
    } catch (error) {
      console.error('Failed to fetch snippets:', error);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  useEffect(() => {
    const filtered = snippets.filter(snippet =>
      snippet.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.language?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSnippets(filtered);
  }, [searchTerm, snippets]);

  const handleLoadSnippet = async (id) => {
    try {
      const res = await axios.get(`${API}/snippets/${id}`);
      setActiveSnippet(res.data);
    } catch (error) {
      console.error('Failed to load snippet:', error);
    }
  };

  const handleSaveSnippet = async (payload) => {
    try {
      const res = await axios.post(`${API}/snippets`, payload);
      setActiveSnippet(res.data);
      fetchSnippets();
    } catch (error) {
      console.error('Failed to save snippet:', error);
    }
  };

  const handleDeleteSnippet = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/snippets/${id}`);
      if (activeSnippet?._id === id) {
        setActiveSnippet(null);
      }
      fetchSnippets();
    } catch (error) {
      console.error('Failed to delete snippet:', error);
    }
  };

  const handleNewSnippet = () => {
    setActiveSnippet({ 
      title: 'Untitled Snippet', 
      language: 'javascript', 
      code: '',
      description: 'New collaborative code snippet'
    });
  };

  const formatDate = (dateString) => {
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
    };
    return colors[language] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Enhanced Sidebar */}
      <aside className="w-80 border-r border-gray-700 bg-gray-800/80 backdrop-blur-lg flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderIcon className="h-6 w-6 text-blue-400" />
              <h2 className="text-lg font-bold">Your Snippets</h2>
            </div>
            <button
              onClick={handleNewSnippet}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition shadow-lg"
            >
              <PlusIcon className="h-4 w-4" />
              New
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
            />
          </div>
        </div>

        {/* Snippets List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSnippets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <FolderIcon className="h-8 w-8 mb-2" />
              <p className="text-sm">No snippets found</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredSnippets.map((snippet) => (
                <div
                  key={snippet._id}
                  onClick={() => handleLoadSnippet(snippet._id)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-all hover:bg-gray-700/50 border ${
                    activeSnippet?._id === snippet._id 
                      ? 'border-blue-400 bg-gray-700/70' 
                      : 'border-gray-700 bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white truncate flex-1">
                      {snippet.title}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteSnippet(snippet._id, e)}
                      className="p-1 hover:bg-gray-600 rounded transition opacity-0 group-hover:opacity-100"
                    >
                      <TrashIcon className="h-3 w-3 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                  
                  {snippet.description && (
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                      {snippet.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${getLanguageColor(snippet.language)}`}></span>
                      <span className="capitalize">{snippet.language}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>{formatDate(snippet.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="text-center text-sm text-gray-400">
            {snippets.length} snippet{snippets.length !== 1 ? 's' : ''} • Ready to collaborate
          </div>
        </div>
      </aside>

      {/* Main Editor Area */}
      <main className="flex-1 h-screen">
        {activeSnippet ? (
          <Editor 
            snippet={activeSnippet} 
            onSave={handleSaveSnippet} 
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Snippet Selected</h3>
              <p className="text-gray-400 mb-6">
                Choose an existing snippet from the sidebar or create a new one to start coding collaboratively.
              </p>
              <button
                onClick={handleNewSnippet}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition font-medium"
              >
                Create New Snippet
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}