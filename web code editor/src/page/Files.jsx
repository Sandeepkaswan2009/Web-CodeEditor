import { useState } from 'react';

const Files = () => {
  const [files, setFiles] = useState([]);

  const handleFileUpload = async (e) => {
    const fileList = Array.from(e.target.files);
    setFiles(prev => [...prev, ...fileList]);
  };

  return (
    <div className="files-container">
      <div className="files-header">
        <h2>File Manager</h2>
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileUpload}
          className="file-input"
        />
        <label htmlFor="file-upload" className="upload-button">
          Upload Files
        </label>
      </div>
      <div className="files-list">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            <span className="file-icon">📄</span>
            <span className="file-name">{file.name}</span>
            <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Files; 