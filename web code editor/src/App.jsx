import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CodeEditor from './page/Editor';
import Chat from './page/Chat';
import Files from './page/Files';
import Settings from './page/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <div className="logo">Web Based CodeAI</div>
          <ul className="nav-links">
            <li><Link to="/"><span className="icon">💻</span>Editor</Link></li>
            <li><Link to="/chat"><span className="icon">💭</span>Chat</Link></li>
            {/* <li><Link to="/files"><span className="icon">📁</span>Files</Link></li> */}
            <li><Link to="/settings"><span className="icon">⚙️</span>Settings</Link></li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<CodeEditor />} />
            <Route path="/chat" element={<Chat />} />
            {/* <Route path="/files" element={<Files />} /> */}
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
