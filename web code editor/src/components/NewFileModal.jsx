import React, { useState } from 'react';
import './NewFileModal.css';

const NewFileModal = ({ onClose, onCreateFile }) => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('javascript');

  const fileTypes = {
    javascript: {
      extension: 'js',
      template: '// JavaScript code here\n\n'
    },
    python: {
      extension: 'py',
      template: '# Python code here\n\n'
    },
    cpp: {
      extension: 'cpp',
      template: `#include <iostream>
using namespace std;

int main() {
    // C++ code here
    cout << "Hello, World!" << endl;
    return 0;
}
`
    },
    java: {
      extension: 'java',
      template: `public class Main {
    public static void main(String[] args) {
        // Java code here
        System.out.println("Hello, World!");
    }
}
`
    }
  };

  const handleCreate = () => {
    if (!fileName.trim()) {
      alert('Please enter a file name');
      return;
    }
    
    const extension = fileTypes[fileType].extension;
    const template = fileTypes[fileType].template;
    const fullFileName = fileName.endsWith(`.${extension}`) 
      ? fileName 
      : `${fileName}.${extension}`;

    onCreateFile(fullFileName, template, fileType);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New File</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="form-group">
          <label>File Name:</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name"
            className="file-name-input"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>File Type:</label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="file-type-select"
          >
            <option value="javascript">JavaScript (.js)</option>
            <option value="python">Python (.py)</option>
            <option value="cpp">C++ (.cpp)</option>
            <option value="java">Java (.java)</option>
          </select>
        </div>
        <div className="modal-buttons">
          <button onClick={handleCreate} className="create-button">
            Create File
          </button>
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewFileModal; 