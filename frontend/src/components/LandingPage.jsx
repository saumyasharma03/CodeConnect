import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar/>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-6">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Collaborative Code Editor
            </h1>
            
            <p className="text-gray-300 text-xl leading-relaxed mb-10 max-w-3xl mx-auto">
              Real-time collaborative coding environment that lets multiple users 
              edit and run code together. Experience seamless collaboration with 
              built-in execution engine and sandboxed environments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => navigate("/editor")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Coding Now →
              </button>
              <button className="px-8 py-4 border border-gray-600 hover:border-gray-400 rounded-xl text-gray-300 hover:text-white text-lg font-medium transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-200">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Collaboration</h3>
              <p className="text-gray-400">Code together in real-time with multiple users simultaneously</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-200">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Sandbox</h3>
              <p className="text-gray-400">Execute code safely in isolated environments</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-200">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-language</h3>
              <p className="text-gray-400">Support for multiple programming languages</p>
            </div>
          </div>

          {/* Challenges Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700 mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Technical Challenges We Solve
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-700/50 transition-colors duration-200">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">⚙️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Multi-language Execution</h4>
                  <p className="text-gray-400 text-sm">Execute user's code in multiple languages seamlessly</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-700/50 transition-colors duration-200">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🛡️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">System Protection</h4>
                  <p className="text-gray-400 text-sm">Isolate execution to protect the host system</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-700/50 transition-colors duration-200">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🏗️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Sandboxed Environments</h4>
                  <p className="text-gray-400 text-sm">Provide isolated environments for each user session</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-700/50 transition-colors duration-200">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">⏳</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Resource Management</h4>
                  <p className="text-gray-400 text-sm">Limit user resources to prevent abuse</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-700/50 transition-colors duration-200">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🚀</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Scalability</h4>
                  <p className="text-gray-400 text-sm">Scale efficiently for high availability</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{"</>"}</span>
              </div>
              <span className="text-lg font-bold text-white">CollabEdit</span>
            </div>
            
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Contact
              </a>
            </div>
            
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Collaborative Code Editor — Built by Saumya Sharma, Ayush Talan, Vanshika Gupta
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-sm">
              Made with ❤️ for the developer community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}