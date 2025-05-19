import React, { createContext, useContext, useState, useEffect } from 'react';

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
  const [editorSettings, setEditorSettings] = useState(() => {
    const savedSettings = localStorage.getItem('editorSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      theme: 'vs-dark',
      fontSize: 14,
      tabSize: 2,
      lineNumbers: true,
      wordWrap: true,
      minimap: true,
      autoSave: true,
      language: 'javascript'
    };
  });

  const [editorState, setEditorState] = useState(() => {
    const savedState = sessionStorage.getItem('editorState');
    return savedState ? JSON.parse(savedState) : {
      code: "// Open a file to edit...",
      language: "javascript",
      output: '',
      projectStructure: null,
      selectedFile: null,
      expandedDirs: []
    };
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('editorSettings', JSON.stringify(editorSettings));
  }, [editorSettings]);

  // Save editor state to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem('editorState', JSON.stringify(editorState));
  }, [editorState]);

  const updateSettings = (newSettings) => {
    setEditorSettings(prev => ({ ...prev, ...newSettings }));
    window.dispatchEvent(new CustomEvent('editorSettingsChanged', { detail: newSettings }));
  };

  const updateEditorState = (newState) => {
    setEditorState(prev => ({ ...prev, ...newState }));
  };

  return (
    <EditorContext.Provider value={{
      editorSettings,
      updateSettings,
      editorState,
      updateEditorState
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext); 