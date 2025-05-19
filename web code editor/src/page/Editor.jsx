import React, { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import axios from 'axios';
import './Editor.css';
import { FaFolder, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import NewFileModal from '../components/NewFileModal';

const VSCodeEditor = () => {
  const [code, setCode] = useState("// Open a file to edit...");  
  const [fileHandle, setFileHandle] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectStructure, setProjectStructure] = useState(null);
  const [currentProjectHandle, setCurrentProjectHandle] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileTree, setShowFileTree] = useState(true);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('javascript');

  // Helper function to determine language from file extension
  const getLanguageFromFileName = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'php': 'php',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
    };
    return languageMap[extension] || 'plaintext';
  };

  // Create new project
  const createNewProject = async () => {
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      // Create project directory
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      });

      // Create initial project structure
      const projectStructure = {
        'src': {
          'index.js': '// Your main application code here\n',
          'styles': {
            'main.css': '/* Your styles here */\n'
          }
        },
        'package.json': JSON.stringify({
          name: projectName,
          version: '1.0.0',
          description: '',
          main: 'src/index.js',
          scripts: {
            start: 'node src/index.js'
          }
        }, null, 2),
        'README.md': `# ${projectName}\n\nDescription of your project goes here.`
      };

      await createProjectFiles(dirHandle, projectStructure);
      setShowNewProjectModal(false);
      setProjectName('');
      alert('Project created successfully!');
    } catch (err) {
      setError(err.message || 'Error creating project');
      console.error('Error creating project:', err);
    }
  };

  // Helper function to create project files recursively
  const createProjectFiles = async (parentHandle, structure) => {
    for (const [name, content] of Object.entries(structure)) {
      if (typeof content === 'object') {
        // Create directory
        const dirHandle = await parentHandle.getDirectoryHandle(name, { create: true });
        await createProjectFiles(dirHandle, content);
      } else {
        // Create file
        const fileHandle = await parentHandle.getFileHandle(name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
      }
    }
  };

  // Function to open project
  const openProject = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      setCurrentProjectHandle(dirHandle);
      const structure = await scanDirectory(dirHandle);
      setProjectStructure(structure);
    } catch (err) {
      console.error("Error opening project:", err);
      setError(err.message);
    }
  };

  // Scan directory recursively
  const scanDirectory = async (dirHandle, path = '') => {
    const entries = [];
    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;
      if (entry.kind === 'directory') {
        const children = await scanDirectory(entry, entryPath);
        entries.push({
          name: entry.name,
          path: entryPath,
          type: 'directory',
          children,
          handle: entry
        });
      } else {
        entries.push({
          name: entry.name,
          path: entryPath,
          type: 'file',
          handle: entry
        });
      }
    }
    return entries.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });
  };

  // Function to open a file from the project
  const openFileFromProject = async (fileHandle) => {
    try {
      const file = await fileHandle.getFile();
      const text = await file.text();
      setCode(text);
      setFileHandle(fileHandle);
      setLanguage(getLanguageFromFileName(file.name));
      setSelectedFile(fileHandle);
    } catch (err) {
      console.error("Error opening file:", err);
      setError(err.message);
    }
  };

  // Open a file from the system
  const openFile = async () => {
    try {
      const [handle] = await window.showOpenFilePicker();
      const file = await handle.getFile();
      const text = await file.text();
      setCode(text);
      setFileHandle(handle);
      // Set language based on file extension
      setLanguage(getLanguageFromFileName(file.name));
    } catch (err) {
      console.error("Error opening file:", err);
    }
  };

  // Save the file back to the system
  const saveFile = async () => {
    if (!fileHandle) return;
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(code);
      await writable.close();
      alert("File saved successfully!");
    } catch (err) {
      console.error("Error saving file:", err);
    }
  };

  const createNewFile = async (fileName, template, language) => {
    try {
      if (!currentProjectHandle) {
        setError('Please open a project first');
        return;
      }

      const fileHandle = await currentProjectHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(template);
      await writable.close();

      // Refresh project structure
      const structure = await scanDirectory(currentProjectHandle);
      setProjectStructure(structure);
      
      // Open the new file
      setCode(template);
      setFileHandle(fileHandle);
      setLanguage(language);
    } catch (err) {
      setError(err.message);
      console.error('Error creating file:', err);
    }
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);
    setOutput('');

    try {
      // Get the current file's language from its extension
      const fileExtension = fileHandle?.name?.split('.').pop()?.toLowerCase();
      const languageMap = {
        'js': 'javascript',
        'py': 'python',
        'cpp': 'cpp',
        'java': 'java'
      };
      
      const executionLanguage = languageMap[fileExtension] || currentLanguage;

      const response = await axios.post('http://localhost:5000/api/chat/execute', {
        code,
        language: executionLanguage
      });

      if (response.data.success) {
        setOutput(response.data.output);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while executing the code');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle directory expansion
  const toggleDirectory = (path) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  // Render file tree recursively with collapsible directories
  const renderFileTree = (items) => {
    return (
      <ul className="file-tree">
        {items.map((item) => (
          <li key={item.path} className="file-tree-item">
            <div 
              className={`file-tree-entry ${item.type} ${selectedFile === item.handle ? 'selected' : ''}`}
              onClick={async () => {
                if (item.type === 'file') {
                  await openFileFromProject(item.handle);
                } else {
                  toggleDirectory(item.path);
                }
              }}
            >
              <span className="file-icon">
                {item.type === 'directory' ? (
                  <>
                    <span className="directory-arrow">
                      {expandedDirs.has(item.path) ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                    <FaFolder />
                  </>
                ) : (
                  <FaFile />
                )}
              </span>
              <span className="file-name">{item.name}</span>
            </div>
            {item.type === 'directory' && expandedDirs.has(item.path) && item.children && (
              <div className="nested-files">
                {renderFileTree(item.children)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>EXPLORER</h3>
          <div className="sidebar-actions">
            {!projectStructure ? (
              <button 
                onClick={openProject}
                className="open-project-sidebar-button"
              >
                Open Folder
              </button>
            ) : (
              <button 
                onClick={() => setShowNewFileModal(true)}
                className="new-file-button"
              >
                New File
              </button>
            )}
          </div>
        </div>
        {projectStructure && (
          <div className="file-explorer">
            {renderFileTree(projectStructure)}
          </div>
        )}
      </div>

      <div className="main-content">
        <div className="editor-header">
          <div className="header-left">
            <h2 className="editor-title">Code Editor</h2>
            <button 
              onClick={() => setShowNewProjectModal(true)}
              className="new-project-button"
            >
              New Project
            </button>
            <button 
              onClick={openProject} 
              className="open-project-button"
            >
              Open Project
            </button>
            <button onClick={openFile} className="open-file-button">
              Open File
            </button>
            <button onClick={saveFile} className="save-file-button">
              Save File
            </button>
          </div>
          <button 
            onClick={handleExecute} 
            disabled={isLoading || !code.trim()}
            className="run-button"
          >
            {isLoading ? 'Running...' : 'Run Code'}
          </button>
        </div>

        <div className="editor-main">
          <div className="editor-content">
            <div className="code-section">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={(value) => setCode(value)}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            </div>

            <div className="output-section">
              <h3>Output</h3>
              {error && (
                <div className="error-message">
                  Error: {error}
                </div>
              )}
              {output && (
                <pre className="output-content">
                  {output}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {showNewProjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Project</h3>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="project-name-input"
            />
            <div className="modal-buttons">
              <button 
                onClick={createNewProject}
                className="create-button"
              >
                Create Project
              </button>
              <button 
                onClick={() => setShowNewProjectModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewFileModal && (
        <NewFileModal
          onClose={() => setShowNewFileModal(false)}
          onCreateFile={createNewFile}
        />
      )}
    </div>
  );
};

export default VSCodeEditor;
