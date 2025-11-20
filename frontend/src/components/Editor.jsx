// CodeEditor.jsx
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
  const [userList, setUserList] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [theme, setTheme] = useState("vs-dark");


  const socketRef = useRef(null);
  const editorRef = useRef(null);
  // map userId -> decoration IDs array returned by deltaDecorations
  const remoteDecorationsRef = useRef({});
  // map userId -> color
  const userColorMapRef = useRef({});
  // monaco model change guard to avoid feedback loop
  const suppressOutgoingRef = useRef(false);

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

  // Initialize template once
  useEffect(() => {
    setCode(templates[language]);
  }, []); // run once on mount

  // -------------------------
  // Socket connection + handlers
  // -------------------------
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000");
    }

    // get username from localStorage (or fallback)
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
   const username = currentUser.name || "Guest";


    // join the room WITH username
    socketRef.current.emit("join-room", { roomId: snippetId, username });

    // code sync (you already had this)
    socketRef.current.on("code-update", (updatedCode) => {
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (!model) return;
        if (model.getValue() !== updatedCode) {
          suppressOutgoingRef.current = true; // avoid rebound
        const currentPosition = editorRef.current.getPosition();
const currentSelection = editorRef.current.getSelection();

model.pushEditOperations(
  [],
  [{ range: model.getFullModelRange(), text: updatedCode }],
  () => null
);

editorRef.current.setPosition(currentPosition);
editorRef.current.setSelection(currentSelection);

          // small timeout to release suppression
          setTimeout(() => (suppressOutgoingRef.current = false), 50);
        }
      } else {
        // fallback set state
        setCode(updatedCode);
      }
    });

    // users count update
    socketRef.current.on("users-update", (count) => {
      setConnectedUsers(count);
    });

    socketRef.current.on("users-list", (list) => {
      setUserList(list);
    });


    // receive remote cursor updates
    socketRef.current.on("cursor-update", ({ userId, username, position, selection }) => {
      renderRemoteCursor(userId, username, position, selection);
    });

    // when someone explicitly left
    socketRef.current.on("user-left", ({ userId }) => {
      removeRemoteCursor(userId);
    });

    // cleanup on unmount / snippetId change
    return () => {
      try {
        socketRef.current.emit("leave-room", { roomId: snippetId });
      } catch (e) {}
    };
  }, [snippetId]); // re-run if snippetId changes

  // Reset code on language change (preserve synced code? for now reset to templates)
// REMOVE the setCode() completely:
useEffect(() => {
  setOutput("");
  setExecutionTime(null);
}, [language]);


  // run after login redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (action) {
      if (action === "run") handleRunCode(true);
      if (action === "save") handleSave(true);
      window.history.replaceState(null, "", location.pathname);
    }
  }, [location.search]);

  // -------------------------
  // Editor change handlers
  // -------------------------
  const handleEditorChange = (value) => {
    // we still keep local code for offline editing / run/save
    setCode(value);
    // send code-change (existing behavior)
    if (socketRef.current && !suppressOutgoingRef.current) {
      socketRef.current.emit("code-change", { snippetId, code: value });
    }
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // listen to cursor position changes
    const posListener = editor.onDidChangeCursorPosition((e) => {
      const position = e.position; // {lineNumber, column}
      const selection = editor.getSelection();
      emitCursor(position, selection);
    });

    // also listen to selection change (drag select)
    const selListener = editor.onDidChangeCursorSelection((e) => {
      const position = editor.getPosition();
      const selection = e.selection;
      emitCursor(position, selection);
    });

    // store listeners for cleanup if needed
    editor._collabListeners = { posListener, selListener };
  };

  const emitCursor = (position, selection) => {
    if (!socketRef.current || !position) return;

    const user = JSON.parse(localStorage.getItem("user")) || {};
const username = user.name || "Guest";



    socketRef.current.emit("cursor-move", {
      roomId: snippetId,
      username,
      position: { lineNumber: position.lineNumber, column: position.column },
      selection: selection
        ? {
            startLineNumber: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLineNumber: selection.endLineNumber,
            endColumn: selection.endColumn,
          }
        : null,
    });
  };

  // -------------------------
  // Remote cursor rendering logic
  // -------------------------
  function getColorForUser(userId) {
    const map = userColorMapRef.current;
    if (map[userId]) return map[userId];
    // choose a color from palette and keep stable
    const palette = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];
    const color = palette[Object.keys(map).length % palette.length];
    map[userId] = color;
    return color;
  }

  function escapeForCssContent(str = "") {
    // naïve escape for double quotes and backslashes
    return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function injectStyleForUser(userId, username, color) {
    const styleId = `remote-style-${userId}`;
    if (document.getElementById(styleId)) return;

    const escapedName = escapeForCssContent(username);
    const style = document.createElement("style");
    style.id = styleId;

    // We use two classes:
    //  - .remote-cursor-<userId> applied to the decoration for the vertical line
    //  - .remote-label-<userId>::after to show the username as a small pill
    style.innerHTML = `
      .remote-cursor-${userId} {
        border-left: 2px solid ${color} !important;
        box-sizing: border-box;
      }
      .remote-label-${userId}::after {
        content: "${escapedName}";
        background: ${color};
        color: white;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 12px;
        line-height: 1;
        margin-left: 6px;
        transform: translateY(-1.8em);
        position: relative;
        white-space: nowrap;
      }
      /* small tweak so the label doesn't overlap the editor gutter */
      .monaco-editor .remote-label-${userId}::after {
        z-index: 2000;
      }
    `;
    document.head.appendChild(style);
  }

  const renderRemoteCursor = (userId, username, position, selection) => {
    try {
      if (!editorRef.current || !position) return;
      const editor = editorRef.current;

      // ensure color & css exist
      const color = getColorForUser(userId);
      injectStyleForUser(userId, username, color);

      // create decoration for the caret (vertical line) and optionally a selection highlight
      const cursorClass = `remote-cursor-${userId}`;
      const labelClass = `remote-label-${userId}`;

      // cursor decoration (position is caret)
      const cursorRange = new window.monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
      );

      const decorations = [];

      decorations.push({
        range: cursorRange,
       options: {
  className: cursorClass,
  beforeContentClassName: labelClass, 
  showEditorCursor: false, // ensures remote caret shows correctly
  stickiness: 1,
},

      });

      // selection highlight if provided (optional: translucent background)
      if (selection) {
        const selRange = new window.monaco.Range(
          selection.startLineNumber,
          selection.startColumn,
          selection.endLineNumber,
          selection.endColumn
        );
        const selClass = `remote-selection-${userId}`;
        // inject style for selection if not present
        const selStyleId = `remote-selection-style-${userId}`;
        if (!document.getElementById(selStyleId)) {
          const selStyle = document.createElement("style");
          selStyle.id = selStyleId;
          selStyle.innerHTML = `
            .${selClass} {
              background-color: ${color}33 !important; /* 33 = ~20% alpha */
            }
          `;
          document.head.appendChild(selStyle);
        }

        decorations.push({
          range: selRange,
          options: { className: selClass, isWholeLine: false, stickiness: 1 },
        });
      } else {
        // if previously had selection decoration for this user, we should remove it
      }

      // apply decorations: replace previous decorations for that user
      const previous = remoteDecorationsRef.current[userId] || [];
      const newDecorationIds = editor.deltaDecorations(previous, decorations);
      remoteDecorationsRef.current[userId] = newDecorationIds;
    } catch (err) {
      // window.monaco may not be set in some rare race conditions
      console.error("renderRemoteCursor error:", err);
    }
  };

  const removeRemoteCursor = (userId) => {
    if (!editorRef.current) return;
    const prev = remoteDecorationsRef.current[userId];
    if (prev && prev.length) {
      try {
        editorRef.current.deltaDecorations(prev, []);
      } catch (e) {}
    }
    // remove stored entries
    delete remoteDecorationsRef.current[userId];
    delete userColorMapRef.current[userId];
    // remove style tags
    const style = document.getElementById(`remote-style-${userId}`);
    if (style) style.remove();
    const selStyle = document.getElementById(`remote-selection-style-${userId}`);
    if (selStyle) selStyle.remove();
  };

  // -------------------------
  // Polling function (unchanged)
  // -------------------------
  const pollJobStatus = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/run/status/${jobId}`);

        if (res.data.state === "completed") {
          clearInterval(interval);
          setLoading(false);
          setOutput(res.data.result.output);
          setExecutionTime(res.data.result.executionTime);
        }

        if (res.data.state === "failed") {
          clearInterval(interval);
          setLoading(false);
          setOutput("❌ Execution failed.");
        }
      } catch (err) {
        clearInterval(interval);
        setLoading(false);
        setOutput("❌ Error checking status.");
      }
    }, 1000);
  };

  const handleRunCode = async (postLogin = false) => {
    if (!postLogin) setLoading(true);

    setOutput("");
    setExecutionTime(null);

    try {
      const { data } = await axios.post("http://localhost:5000/api/run/run", {
        code,
        language,
      });

      const jobId = data.jobId;
      pollJobStatus(jobId);
    } catch (err) {
      setLoading(false);
      setOutput("❌ Server error, try again.");
    }
  };

  const handleSaveClick = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}&action=save`);
      return;
    }
    setShowTitleModal(true);
  };

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not logged in");

      await axios.post(
        "http://localhost:5000/api/project/save",
        { projectId, title: projectTitle, code, language },
        { headers: { Authorization: `Bearer ${user.token}` } }
      ).then((res) => {
        if (!projectId) setProjectId(res.data.project._id);
      });

      alert("✅ Saved!");
      setShowTitleModal(false);
      setProjectTitle("");
    } catch (err) {
      alert("❌ Save failed");
    }
  };

  const handleRunClick = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}&action=run`);
      return;
    }
    handleRunCode(true);
  };

  // cleanup when component unmounts: remove remote decorations + disconnect socket listeners
  useEffect(() => {
    return () => {
      // remove all remote styles & decorations
      Object.keys(remoteDecorationsRef.current).forEach((uid) => removeRemoteCursor(uid));
      if (socketRef.current) {
        try {
          socketRef.current.emit("leave-room", { roomId: snippetId });
          socketRef.current.disconnect();
        } catch (e) {}
      }
      // remove editor listeners
      if (editorRef.current && editorRef.current._collabListeners) {
        const { posListener, selListener } = editorRef.current._collabListeners;
        posListener && posListener.dispose();
        selListener && selListener.dispose();
      }
    };
  }, []);

  // -------------------------
  // UI Render (your original JSX with Editor)
  // -------------------------
  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-gray-800/80 backdrop-blur-lg border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CodeBracketIcon className="h-6 w-6 text-blue-400" />
            <h1 className="text-white text-xl font-bold">CollabCode</h1>
          </div>
          <div
            onClick={() => setShowUserModal(true)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
          >
            <UsersIcon className="h-4 w-4 text-green-400" />
            <span className="text-white text-sm">{userList.length} online</span>
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
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              } catch (err) {
                console.error("Failed to copy:", err);
              }
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-700 text-white border border-gray-600 text-sm"
          >
            <ClipboardIcon className="h-4 w-4" />
            {isCopied ? "Copied!" : "Copy"}
          </button>

          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                alert("Share link copied!");
              } catch (err) {
                console.error("Failed to copy link:", err);
              }
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-600 text-white text-sm"
          >
            <ShareIcon className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={code}
          onChange={handleEditorChange}
          onMount={(editor, monaco) => {
            // expose monaco on window for Range usage in renderRemoteCursor
            if (!window.monaco) window.monaco = monaco;
            handleEditorMount(editor, monaco);
          }}
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbers: "on",
          }}
        />

        <div className="absolute top-3 right-3 bg-gray-800/90 text-white px-2 py-1 rounded text-xs border border-gray-600">
          {languageConfigs[language].icon} {languageConfigs[language].name}
        </div>
      </div>

      {/* OUTPUT */}
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
              className="flex items-center gap-2 px-4 py-1 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm"
            >
              <PlayIcon className="h-4 w-4" />
              {loading ? "Running..." : "Run"}
            </button>

            <button
              onClick={handleSaveClick}
              className="flex items-center gap-2 px-4 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm"
            >
              <BookmarkIcon className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>

        <div className="h-40 overflow-auto">
          {output ? (
            <pre className="p-3 font-mono text-sm text-green-400 whitespace-pre-wrap">
              {output}
            </pre>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Output will appear here
            </div>
          )}
        </div>
      </div>

      {showUserModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg w-80 shadow-xl">

      <h3 className="text-white text-lg font-semibold mb-4">
        Online Users
      </h3>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {userList.map((user) => (
          <div
            key={user.userId}
            className="px-3 py-2 bg-gray-700 rounded text-white"
          >
            {user.username}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowUserModal(false)}
          className="px-4 py-1 rounded border border-gray-500 text-gray-300"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}


      {/* SAVE TITLE MODAL */}
      {showTitleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg w-96 shadow-xl">
            <h3 className="text-white text-lg font-semibold mb-4">
              Enter Project Title
            </h3>

            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="My Awesome Code"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowTitleModal(false)}
                className="px-4 py-1 rounded border border-gray-500 text-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-1 rounded bg-purple-500 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
