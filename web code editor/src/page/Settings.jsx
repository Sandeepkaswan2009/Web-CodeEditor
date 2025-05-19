import React from 'react';
import { useEditor } from '../context/EditorContext';
import './Settings.css';

const Settings = () => {
  const { editorSettings, updateSettings } = useEditor();

  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Editor Settings</h2>
      
      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="setting-item">
          <label>Theme:</label>
          <select 
            value={editorSettings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            <option value="vs-dark">Dark</option>
            <option value="vs-light">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>

        <div className="setting-item">
          <label>Font Size:</label>
          <input 
            type="number"
            min="8"
            max="32"
            value={editorSettings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Editor</h3>
        <div className="setting-item">
          <label>Tab Size:</label>
          <input 
            type="number"
            min="1"
            max="8"
            value={editorSettings.tabSize}
            onChange={(e) => handleSettingChange('tabSize', parseInt(e.target.value))}
          />
        </div>

        <div className="setting-item">
          <label>Line Numbers:</label>
          <input 
            type="checkbox"
            checked={editorSettings.lineNumbers}
            onChange={(e) => handleSettingChange('lineNumbers', e.target.checked)}
          />
        </div>

        <div className="setting-item">
          <label>Word Wrap:</label>
          <input 
            type="checkbox"
            checked={editorSettings.wordWrap}
            onChange={(e) => handleSettingChange('wordWrap', e.target.checked)}
          />
        </div>

        <div className="setting-item">
          <label>Minimap:</label>
          <input 
            type="checkbox"
            checked={editorSettings.minimap}
            onChange={(e) => handleSettingChange('minimap', e.target.checked)}
          />
        </div>

        <div className="setting-item">
          <label>Auto Save:</label>
          <input 
            type="checkbox"
            checked={editorSettings.autoSave}
            onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Language</h3>
        <div className="setting-item">
          <label>Default Language:</label>
          <select 
            value={editorSettings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings; 