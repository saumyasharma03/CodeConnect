import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PlayIcon,
  ClipboardIcon,
  ShareIcon,
  UsersIcon,
  CodeBracketIcon,
  ClockIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

export default function CodeEditor({ snippetId = "default-snippet" }) {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [executionTime, setExecutionTime] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [theme, setTheme] = useState("vs-dark");

  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const templates = {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    python: `print("Hello, World!")`,
    javascript: `console.log("Hello, World!");`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  };

  const languageConfigs = {
    cpp: { name: "C++", extension: "cpp", icon: "🔵" },
    python: { name: "Python", extension: "py", icon: "🟡" },
    javascript: { name: "JavaScript", extension: "js", icon: "🟨" },
    java: { name: "Java", extension: "java", icon: "🟠" },
  };

  // Initialize code template
  useEffect(() => {
    setCode(templates[language]);
  }, []);

  // Socket connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000");
    }
    socketRef.current.emit("join-room", snippetId);

    socketRef.current.on("code-update", (updatedCode) => {
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model.getValue() !== updatedCode) model.setValue(updatedCode);
      }
    });

    socketRef.current.on("users-update", setConnectedUsers);

    return () => {
      socketRef.current.emit("leave-room", snippetId);
    };
  }, [snippetId]);

  // Reset code/output when language changes
  useEffect(() => {
    setCode(templates[language]);
    setOutput("");
    setExecutionTime(null);
  }, [language, snippetId]);

  // Automatic action after login redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (action) {
      if (action === "run") handleRunCode(true);
      if (action === "save") handleSave(true);
      window.history.replaceState(null, "", location.pathname);
    }
  }, [location.search]);

  const handleEditorChange = (value) => {
    setCode(value);
    socketRef.current.emit("code-change", { snippetId, code: value });
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Share link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy share link:", err);
    }
  };

  // Run code
  const handleRunCode = async (postLogin = false) => {
    if (!postLogin) setLoading(true);
    setOutput("");
    setExecutionTime(null);

    const startTime = performance.now();
    try {
      const { data } = await axios.post("http://localhost:5000/api/run/run", {
        code,
        language,
      });
      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));
      setOutput(data.output || "Execution completed.");
    } catch (err) {
      setOutput("❌ Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save code
  const handleSave = async (postLogin = false) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not logged in");

      await axios.post(
        "http://localhost:5000/api/snippets",
        { code, language, snippetId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      alert("✅ Code saved successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save code, please try again.");
    }
  };

  // Handle Save click
  const handleSaveClick = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log(user);
    if (!user) {
      // Always redirect to login/signup page if not logged in
      navigate(
        `/auth?redirect=${encodeURIComponent(location.pathname)}&action=save`
      );
      return;
    }
    handleSave(true);
  };

  // Handle Run click
  const handleRunClick = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      // Redirect to login if needed
      navigate(
        `/auth?redirect=${encodeURIComponent(location.pathname)}&action=run`
      );
      return;
    }
    handleRunCode(true);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800/80 backdrop-blur-lg border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CodeBracketIcon className="h-6 w-6 text-blue-400" />
            <h1 className="text-white text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CollabCode
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg">
            <UsersIcon className="h-4 w-4 text-green-400" />
            <span className="text-white text-sm">{connectedUsers} online</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg border border-gray-600 text-sm"
          >
            <option value="vs-dark">Dark</option>
            <option value="vs-light">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg border border-gray-600 text-sm"
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-700 text-white hover:bg-gray-600 border border-gray-600 text-sm"
          >
            <ClipboardIcon className="h-4 w-4" />
            {isCopied ? "Copied!" : "Copy"}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm"
          >
            <ShareIcon className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbers: "on",
            glyphMargin: true,
            folding: true,
            detectIndentation: true,
            tabSize: 2,
            wordWrap: "on",
          }}
        />
        <div className="absolute top-3 right-3 bg-gray-800/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs border border-gray-600">
          {languageConfigs[language]?.icon} {languageConfigs[language]?.name}
        </div>
      </div>

      {/* Output + Run/Save */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h3 className="text-white font-semibold">Output</h3>
            {executionTime && (
              <div className="flex items-center gap-1 text-sm text-gray-300">
                <ClockIcon className="h-4 w-4" />
                <span>{executionTime}ms</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunClick}
              className="flex items-center gap-2 px-4 py-1 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium shadow-md hover:from-green-600 hover:to-blue-600 transition-all text-sm"
            >
              <PlayIcon className="h-4 w-4" />
              {loading ? "Running..." : "Run"}
            </button>

            <button
              onClick={handleSaveClick}
              className="flex items-center gap-2 px-4 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-md hover:from-purple-600 hover:to-pink-600 transition-all text-sm"
            >
              <BookmarkIcon className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>

        <div className="h-40 overflow-auto">
          {output ? (
            <pre className="p-3 font-mono text-sm text-green-400 whitespace-pre-wrap">{output}</pre>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Output will appear here after execution
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
