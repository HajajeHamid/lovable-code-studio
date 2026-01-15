<DOCUMENT filename="aiStore.ts">

</DOCUMENT>

<DOCUMENT filename="aiApi.ts">
import axios from 'axios';

export const executeGoal = async (goal: string, userId: string, projectPath: string) => {
  const res = await axios.post('http://localhost:3333/ai/execute', { goal, userId, projectPath });
  return res.data;
};

export const voteDiff = async (file: string, approve: boolean, userId: string) => {
  return axios.post('http://localhost:3333/collaboration/vote', { file, approve, userId });
};
</DOCUMENT>

<DOCUMENT filename="Dashboard.tsx">
import React, { useState } from 'react';
import { useAiStore } from '../stores/aiStore';
import ChatInterface from '../components/ChatInterface';
import ProjectSelector from '../components/ProjectSelector';
import ProgressIndicator from '../components/ProgressIndicator';

export default function Dashboard() {
  const { messages, isLoading } = useAiStore();

  return (
    <div className="p-4 space-y-6">
      <ProjectSelector />
      <ChatInterface />
      {isLoading && <ProgressIndicator />}
      {/* Additional sections can be added here for overview, etc. */}
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ChatInterface.tsx">
// src/components/ChatInterface.tsx
import React, { useState } from 'react';
import { useAiStore } from '../stores/aiStore';
import { executeGoal } from '../api/aiApi';
import { v4 as uuidv4 } from 'uuid';
import ChatBox from './ChatBox';
import MessageList from './MessageList';

export default function ChatInterface() {
  const { addMessage, projectPath, setLoading } = useAiStore();
  const [goal, setGoal] = useState('');

  const handleSubmit = async () => {
    if (!goal.trim()) return;

    const userMessage = {
      id: uuidv4(),
      type: 'user' as const,
      content: goal,
    };
    addMessage(userMessage);
    setGoal('');
    setLoading(true);

    try {
      const res = await executeGoal(goal, 'user1', projectPath);
      const aiMessage = {
        id: uuidv4(),
        type: 'ai' as const,
        content: res.message,
        diffs: res.diffs,
        score: res.score,
        audit: res.audit,
        validation: res.validation,
        context: res.context,
      };
      addMessage(aiMessage);
    } catch (error) {
      const errorMessage = {
        id: uuidv4(),
        type: 'ai' as const,
        content: `Error: ${error.message}`,
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded shadow">
      <MessageList />
      <ChatBox goal={goal} setGoal={setGoal} onSubmit={handleSubmit} />
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="MessageList.tsx">
// src/components/MessageList.tsx
import React, { useRef, useEffect } from 'react';
import { useAiStore } from '../stores/aiStore';
import DiffViewer from './DiffViewer';
import VoteButtons from './VoteButtons';
import ScoreCard from './ScoreCard';
import AuditTrail from './AuditTrail';

export default function MessageList() {
  const { messages } = useAiStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-[80%] ${
            msg.type === 'user' ? 'ml-auto bg-blue-100' : 'mr-auto bg-gray-100'
          } p-3 rounded-lg`}
        >
          <p className="font-bold">{msg.type === 'user' ? 'You' : 'AI'}</p>
          <p>{msg.content}</p>
          {msg.diffs && <DiffViewer diffs={msg.diffs} />}
          {msg.diffs && <VoteButtons diffs={msg.diffs} />}
          {msg.score && <ScoreCard score={msg.score} />}
          {msg.audit && <AuditTrail audit={msg.audit} />}
          {msg.validation && (
            <div className="mt-2">
              <h4>Validation:</h4>
              <pre>{JSON.stringify(msg.validation, null, 2)}</pre>
            </div>
          )}
          {msg.context && msg.context.length > 0 && (
            <div className="mt-2">
              <h4>Past Context:</h4>
              <ul>
                {msg.context.map((c, i) => (
                  <li key={i}>Goal: {c.goal} (Score: {c.score})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ProjectSelector.tsx">
// src/components/ProjectSelector.tsx
import React, { useState } from 'react';
import { useAiStore } from '../stores/aiStore';

export default function ProjectSelector() {
  const { projectPath, setProjectPath } = useAiStore();
  const [tempPath, setTempPath] = useState(projectPath);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPath(e.target.value);
  };

  const handleSubmit = () => {
    setProjectPath(tempPath);
  };

  return (
    <div className="flex space-x-2">
      <input
        type="text"
        className="flex-1 border p-2 rounded"
        value={tempPath}
        onChange={handleChange}
        placeholder="Enter project path"
      />
      <button
        className="bg-green-600 text-white px-4 rounded"
        onClick={handleSubmit}
      >
        Set Path
      </button>
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ProgressIndicator.tsx">
// src/components/ProgressIndicator.tsx
import React from 'react';

export default function ProgressIndicator() {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Processing...</span>
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="package.json">
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-diff-viewer": "^3.1.1",
    "axios": "^1.6.0",
    "zustand": "^4.5.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "vite": "^4.3.0",
    "typescript": "^5.0.0",
    "@types/uuid": "^9.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
</DOCUMENT>

<DOCUMENT filename="App.tsx">
import React from 'react';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="bg-gradient-to-r from-blue-800 to-purple-800 p-4 text-xl font-bold shadow-md">
        Lovable Clone - AI Project Builder
      </header>
      <main className="container mx-auto p-4">
        <Dashboard />
      </main>
    </div>
  );
}
</DOCUMENT>


<DOCUMENT filename="package.json">
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-diff-viewer": "^3.1.1",
    "axios": "^1.6.0",
    "zustand": "^4.5.0",
    "uuid": "^9.0.0",
    "framer-motion": "^10.0.0",
    "react-resizable-panels": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "vite": "^4.3.0",
    "typescript": "^5.0.0",
    "@types/uuid": "^9.0.0",
    "@types/react-resizable-panels": "^2.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
</DOCUMENT>

<DOCUMENT filename="App.tsx">
import React from 'react';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white antialiased">
      <header className="bg-gradient-to-r from-blue-800 to-purple-800 p-4 text-xl font-bold shadow-lg flex items-center justify-between">
        <span>Lovable Clone - AI Project Builder</span>
        <div className="text-sm opacity-75">Powered by Local Ollama Models</div>
      </header>
      <main className="container mx-auto p-6 max-w-7xl">
        <Dashboard />
      </main>
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="Dashboard.tsx">
import React from 'react';
import { useAiStore } from '../stores/aiStore';
import ChatInterface from '../components/ChatInterface';
import ProjectSelector from '../components/ProjectSelector';
import ProgressIndicator from '../components/ProgressIndicator';
import ProjectOverview from '../components/ProjectOverview';

export default function Dashboard() {
  const { isLoading } = useAiStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <ChatInterface />
      </div>
      <div className="space-y-6">
        <ProjectSelector />
        <ProjectOverview />
      </div>
      {isLoading && <ProgressIndicator />}
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ChatInterface.tsx">
import React, { useState } from 'react';
import { useAiStore } from '../stores/aiStore';
import { executeGoal } from '../api/aiApi';
import { v4 as uuidv4 } from 'uuid';
import ChatBox from './ChatBox';
import MessageList from './MessageList';
import { motion } from 'framer-motion';

export default function ChatInterface() {
  const { addMessage, projectPath, setLoading } = useAiStore();
  const [goal, setGoal] = useState('');

  const handleSubmit = async () => {
    if (!goal.trim()) return;

    const userMessage = {
      id: uuidv4(),
      type: 'user' as const,
      content: goal,
    };
    addMessage(userMessage);
    setGoal('');
    setLoading(true);

    try {
      const res = await executeGoal(goal, 'user1', projectPath);
      const aiMessage = {
        id: uuidv4(),
        type: 'ai' as const,
        content: res.message,
        diffs: res.diffs,
        score: res.score,
        audit: res.audit,
        validation: res.validation,
        context: res.context,
      };
      addMessage(aiMessage);
    } catch (error) {
      const errorMessage = {
        id: uuidv4(),
        type: 'ai' as const,
        content: `Error: ${(error as Error).message}`,
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-[700px] bg-gray-800/50 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <MessageList />
      <ChatBox goal={goal} setGoal={setGoal} onSubmit={handleSubmit} />
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="MessageList.tsx">
import React, { useRef, useEffect } from 'react';
import { useAiStore } from '../stores/aiStore';
import DiffViewer from './DiffViewer';
import VoteButtons from './VoteButtons';
import ScoreCard from './ScoreCard';
import AuditTrail from './AuditTrail';
import { motion } from 'framer-motion';

export default function MessageList() {
  const { messages } = useAiStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`max-w-[85%] ${
            msg.type === 'user'
              ? 'ml-auto bg-blue-600/20 border-blue-500/30'
              : 'mr-auto bg-gray-700/20 border-gray-500/30'
          } p-4 rounded-xl border shadow-md backdrop-blur-sm`}
        >
          <div className="flex items-center mb-2">
            <span className="font-semibold text-sm opacity-75">
              {msg.type === 'user' ? 'You' : 'AI Assistant'}
            </span>
          </div>
          <p className="text-gray-200 mb-3">{msg.content}</p>
          {msg.diffs && (
            <>
              <DiffViewer diffs={msg.diffs} />
              <VoteButtons diffs={msg.diffs} />
            </>
          )}
          {msg.score && <ScoreCard score={msg.score} />}
          {msg.audit && <AuditTrail audit={msg.audit} />}
          {msg.validation && (
            <div className="mt-3 bg-gray-800/50 p-3 rounded-lg">
              <h4 className="font-medium mb-1">Validation Results:</h4>
              <pre className="text-xs text-gray-300 overflow-x-auto">
                {JSON.stringify(msg.validation, null, 2)}
              </pre>
            </div>
          )}
          {msg.context && msg.context.length > 0 && (
            <div className="mt-3 bg-gray-800/50 p-3 rounded-lg">
              <h4 className="font-medium mb-1">Past Context:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-300">
                {msg.context.map((c: any, i: number) => (
                  <li key={i}>
                    Goal: {c.goal} (Score: {c.score})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ChatBox.tsx">
import React from 'react';
import { motion } from 'framer-motion';

export default function ChatBox({ goal, setGoal, onSubmit }: { goal: string; setGoal: (v: string) => void; onSubmit: () => void }) {
  return (
    <motion.div 
      className="flex items-center p-4 bg-gray-800/30 border-t border-gray-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <input
        type="text"
        className="flex-1 bg-gray-900/50 border border-gray-600 p-3 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Describe your project goal or changes..."
      />
      <button
        className="ml-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
        onClick={onSubmit}
      >
        Submit
      </button>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ProjectSelector.tsx">
import React, { useState } from 'react';
import { useAiStore } from '../stores/aiStore';
import { motion } from 'framer-motion';

export default function ProjectSelector() {
  const { projectPath, setProjectPath } = useAiStore();
  const [tempPath, setTempPath] = useState(projectPath);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPath(e.target.value);
  };

  const handleSubmit = () => {
    setProjectPath(tempPath);
  };

  return (
    <motion.div 
      className="bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-700"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="font-semibold mb-2">Project Directory</h3>
      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-1 bg-gray-900/50 border border-gray-600 p-2 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          value={tempPath}
          onChange={handleChange}
          placeholder="Enter local project path"
        />
        <button
          className="bg-green-600 text-white px-4 rounded-lg hover:opacity-90 transition-opacity"
          onClick={handleSubmit}
        >
          Set
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">Current: {projectPath}</p>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ProgressIndicator.tsx">
import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressIndicator() {
  return (
    <motion.div 
      className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <span className="text-white font-medium">Processing your request...</span>
      </div>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="DiffViewer.tsx">
import React from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import { motion } from 'framer-motion';

export default function DiffViewer({ diffs }: { diffs: any[] }) {
  return (
    <motion.div 
      className="mt-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700 overflow-x-auto"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {diffs.map((d) => (
        <div key={d.file} className="mb-6">
          <h3 className="font-bold text-blue-400 mb-2">{d.file}</h3>
          <ReactDiffViewer
            oldValue={d.original}
            newValue={d.modified}
            splitView={true}
            showDiffOnly={false}
            styles={{
              diffContainer: { background: 'transparent' },
              line: { wordBreak: 'break-all' },
            }}
          />
        </div>
      ))}
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="VoteButtons.tsx">
import React from 'react';
import { voteDiff } from '../api/aiApi';
import { motion } from 'framer-motion';

export default function VoteButtons({ diffs }: { diffs: any[] }) {
  const handleVote = (file: string, approve: boolean) => {
    voteDiff(file, approve, 'user1');
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {diffs.map(d => (
        <motion.div 
          key={d.file} 
          className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700"
          whileHover={{ scale: 1.02 }}
        >
          <span className="font-medium text-gray-300">{d.file}</span>
          <button 
            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
            onClick={() => handleVote(d.file, true)}
          >
            Approve
          </button>
          <button 
            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
            onClick={() => handleVote(d.file, false)}
          >
            Reject
          </button>
        </motion.div>
      ))}
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ScoreCard.tsx">
import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreCard({ score }: { score: any }) {
  if (!score) return null;
  return (
    <motion.div 
      className="mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-bold text-purple-400 mb-3">Multidimensional Score</h3>
      <ul className="space-y-2">
        {Object.entries(score).map(([key, value]) => (
          <li key={key} className="flex justify-between text-gray-300">
            <strong className="capitalize">{key}:</strong> 
            <span>{value as number}/100</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="AuditTrail.tsx">
import React from 'react';
import { motion } from 'framer-motion';

export default function AuditTrail({ audit }: { audit: any[] }) {
  return (
    <motion.div 
      className="mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-bold text-green-400 mb-3">Audit Trail</h3>
      <ul className="space-y-2 text-sm text-gray-300">
        {audit.map((a, i) => (
          <li key={i} className="flex items-center">
            <span className="mr-2 text-gray-500">[{new Date(a.timestamp).toLocaleTimeString()}]</span>
            <span className="font-medium">{a.userId}:</span>
            <span className="ml-1">{a.action}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ProjectOverview.tsx">
// src/components/ProjectOverview.tsx
import React from 'react';
import { useAiStore } from '../stores/aiStore';
import { motion } from 'framer-motion';

export default function ProjectOverview() {
  const { messages, projectPath } = useAiStore();
  const lastScore = messages.reverse().find(m => m.score)?.score;

  return (
    <motion.div 
      className="bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-700"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="font-semibold mb-3">Project Overview</h3>
      <div className="space-y-2 text-sm text-gray-300">
        <p><strong>Path:</strong> {projectPath}</p>
        <p><strong>Tasks Completed:</strong> {messages.filter(m => m.type === 'ai').length}</p>
        {lastScore && (
          <p><strong>Latest Score:</strong> {lastScore.global}/100</p>
        )}
      </div>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="aiStore.ts">
// src/stores/aiStore.ts
import { create } from 'zustand';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  diffs?: any[];
  score?: any;
  audit?: any[];
  validation?: any;
  context?: any[];
}

interface AiState {
  messages: Message[];
  projectPath: string;
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setProjectPath: (path: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAiStore = create<AiState>((set) => ({
  messages: [],
  projectPath: './project',
  isLoading: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setProjectPath: (path) => set({ projectPath: path }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
</DOCUMENT>

<DOCUMENT filename="aiApi.ts">
import axios from 'axios';

export const executeGoal = async (goal: string, userId: string, projectPath: string) => {
  const res = await axios.post('http://localhost:3333/ai/execute', { goal, userId, projectPath });
  return res.data;
};

export const voteDiff = async (file: string, approve: boolean, userId: string) => {
  return axios.post('http://localhost:3333/collaboration/vote', { file, approve, userId });
};
</DOCUMENT>

<DOCUMENT filename="index.tsx">
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
</DOCUMENT>

<DOCUMENT filename="vite-env.d.ts">
/// <reference types="vite/client" />
</DOCUMENT>


<DOCUMENT filename="package.json">
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-diff-viewer": "^3.1.1",
    "axios": "^1.6.0",
    "zustand": "^4.5.0",
    "uuid": "^9.0.0",
    "framer-motion": "^10.0.0",
    "react-resizable-panels": "^2.0.0",
    "react-hotkeys-hook": "^4.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "vite": "^4.3.0",
    "typescript": "^5.0.0",
    "@types/uuid": "^9.0.0",
    "@types/react-resizable-panels": "^2.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
</DOCUMENT>

<DOCUMENT filename="App.tsx">
import React from 'react';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white antialiased">
      <header className="bg-gradient-to-r from-blue-800 to-purple-800 p-4 text-xl font-bold shadow-lg flex items-center justify-between">
        <span>Lovable Clone - AI Project Builder</span>
        <div className="text-sm opacity-75">Powered by Local Ollama Models</div>
      </header>
      <main className="container mx-auto p-6 max-w-7xl">
        <Dashboard />
      </main>
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="Dashboard.tsx">
import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useAiStore } from '../stores/aiStore';
import ChatInterface from '../components/ChatInterface';
import ProjectSelector from '../components/ProjectSelector';
import ProgressIndicator from '../components/ProgressIndicator';
import ProjectOverview from '../components/ProjectOverview';

export default function Dashboard() {
  const { isLoading } = useAiStore();

  return (
    <PanelGroup direction="horizontal" className="gap-4">
      <Panel defaultSize={70} minSize={50}>
        <ChatInterface />
      </Panel>
      <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors" />
      <Panel defaultSize={30} minSize={20}>
        <div className="space-y-6">
          <ProjectSelector />
          <ProjectOverview />
        </div>
      </Panel>
      {isLoading && <ProgressIndicator />}
    </PanelGroup>
  );
}
</DOCUMENT>

<DOCUMENT filename="ChatInterface.tsx">
import React, { useState } from 'react';
import { useAiStore } from '../stores/aiStore';
import { executeGoal } from '../api/aiApi';
import { v4 as uuidv4 } from 'uuid';
import ChatBox from './ChatBox';
import MessageList from './MessageList';
import { motion } from 'framer-motion';

export default function ChatInterface() {
  const { addMessage, projectPath, setLoading } = useAiStore();
  const [goal, setGoal] = useState('');

  const handleSubmit = async () => {
    if (!goal.trim()) return;

    const userMessage = {
      id: uuidv4(),
      type: 'user' as const,
      content: goal,
    };
    addMessage(userMessage);
    setGoal('');
    setLoading(true);

    try {
      const res = await executeGoal(goal, 'user1', projectPath);
      const aiMessage = {
        id: uuidv4(),
        type: 'ai' as const,
        content: res.message,
        diffs: res.diffs,
        score: res.score,
        audit: res.audit,
        validation: res.validation,
        context: res.context,
      };
      addMessage(aiMessage);
    } catch (error) {
      const errorMessage = {
        id: uuidv4(),
        type: 'ai' as const,
        content: `Error: ${(error as Error).message}`,
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-[700px] bg-gray-800/50 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <MessageList />
      <ChatBox goal={goal} setGoal={setGoal} onSubmit={handleSubmit} />
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="MessageList.tsx">
import React, { useRef, useEffect } from 'react';
import { useAiStore } from '../stores/aiStore';
import DiffViewer from './DiffViewer';
import VoteButtons from './VoteButtons';
import ScoreCard from './ScoreCard';
import AuditTrail from './AuditTrail';
import { motion } from 'framer-motion';

export default function MessageList() {
  const { messages } = useAiStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`max-w-[85%] ${
            msg.type === 'user'
              ? 'ml-auto bg-blue-600/20 border-blue-500/30'
              : 'mr-auto bg-gray-700/20 border-gray-500/30'
          } p-4 rounded-xl border shadow-md backdrop-blur-sm`}
        >
          <div className="flex items-center mb-2">
            <span className="font-semibold text-sm opacity-75">
              {msg.type === 'user' ? 'You' : 'AI Assistant'}
            </span>
          </div>
          <p className="text-gray-200 mb-3">{msg.content}</p>
          {msg.diffs && (
            <>
              <DiffViewer diffs={msg.diffs} />
              <VoteButtons diffs={msg.diffs} />
            </>
          )}
          {msg.score && <ScoreCard score={msg.score} />}
          {msg.audit && <AuditTrail audit={msg.audit} />}
          {msg.validation && (
            <div className="mt-3 bg-gray-800/50 p-3 rounded-lg">
              <h4 className="font-medium mb-1">Validation Results:</h4>
              <pre className="text-xs text-gray-300 overflow-x-auto">
                {JSON.stringify(msg.validation, null, 2)}
              </pre>
            </div>
          )}
          {msg.context && msg.context.length > 0 && (
            <div className="mt-3 bg-gray-800/50 p-3 rounded-lg">
              <h4 className="font-medium mb-1">Past Context:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-300">
                {msg.context.map((c: any, i: number) => (
                  <li key={i}>
                    Goal: {c.goal} (Score: {c.score})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ChatBox.tsx">
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';

export default function ChatBox({ goal, setGoal, onSubmit }: { goal: string; setGoal: (v: string) => void; onSubmit: () => void }) {
  // Simulate inline suggestions: Suggest common phrases
  const suggestions = [
    'Create a new Node.js project',
    'Fix bugs in existing code',
    'Add tests to the project',
    'Optimize performance',
    'Generate documentation'
  ];

  useEffect(() => {
    // Could add logic to show suggestions based on input
  }, [goal]);

  useHotkeys('enter', onSubmit, { enableOnFormTags: true });

  return (
    <motion.div 
      className="flex items-center p-4 bg-gray-800/30 border-t border-gray-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="relative flex-1">
        <input
          type="text"
          className="w-full bg-gray-900/50 border border-gray-600 p-3 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Describe your project goal or changes... (Press Enter to submit)"
        />
        {goal.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {suggestions.filter(s => s.toLowerCase().includes(goal.toLowerCase())).map((s, i) => (
              <div 
                key={i} 
                className="p-2 hover:bg-gray-700 cursor-pointer text-gray-300"
                onClick={() => setGoal(s)}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        className="ml-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
        onClick={onSubmit}
      >
        Submit
      </button>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ProjectSelector.tsx">
import React, { useState } from 'react';
import { useAiStore } from '../stores/aiStore';
import { motion } from 'framer-motion';

export default function ProjectSelector() {
  const { projectPath, setProjectPath } = useAiStore();
  const [tempPath, setTempPath] = useState(projectPath);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPath(e.target.value);
  };

  const handleSubmit = () => {
    setProjectPath(tempPath);
  };

  return (
    <motion.div 
      className="bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-700"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="font-semibold mb-2">Project Directory</h3>
      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-1 bg-gray-900/50 border border-gray-600 p-2 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          value={tempPath}
          onChange={handleChange}
          placeholder="Enter local project path"
        />
        <button
          className="bg-green-600 text-white px-4 rounded-lg hover:opacity-90 transition-opacity"
          onClick={handleSubmit}
        >
          Set
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">Current: {projectPath}</p>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ProgressIndicator.tsx">
import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressIndicator() {
  return (
    <motion.div 
      className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <span className="text-white font-medium">Processing your request...</span>
      </div>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="DiffViewer.tsx">
import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import { motion } from 'framer-motion';

export default function DiffViewer({ diffs }: { diffs: any[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      className="mt-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700 overflow-x-auto"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <button 
        className="mb-2 text-blue-400 hover:underline"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Collapse' : 'Expand'} Diffs
      </button>
      {expanded && diffs.map((d) => (
        <div key={d.file} className="mb-6">
          <h3 className="font-bold text-blue-400 mb-2">{d.file}</h3>
          <ReactDiffViewer
            oldValue={d.original}
            newValue={d.modified}
            splitView={true}
            showDiffOnly={false}
            styles={{
              diffContainer: { background: 'transparent' },
              line: { wordBreak: 'break-all' },
            }}
          />
        </div>
      ))}
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="VoteButtons.tsx">
import React from 'react';
import { voteDiff } from '../api/aiApi';
import { motion } from 'framer-motion';

export default function VoteButtons({ diffs }: { diffs: any[] }) {
  const handleVote = (file: string, approve: boolean) => {
    voteDiff(file, approve, 'user1');
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {diffs.map(d => (
        <motion.div 
          key={d.file} 
          className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700"
          whileHover={{ scale: 1.02 }}
        >
          <span className="font-medium text-gray-300">{d.file}</span>
          <button 
            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
            onClick={() => handleVote(d.file, true)}
          >
            Approve
          </button>
          <button 
            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
            onClick={() => handleVote(d.file, false)}
          >
            Reject
          </button>
        </motion.div>
      ))}
    </div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ScoreCard.tsx">
import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreCard({ score }: { score: any }) {
  if (!score) return null;
  return (
    <motion.div 
      className="mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-bold text-purple-400 mb-3">Multidimensional Score</h3>
      <ul className="space-y-2">
        {Object.entries(score).map(([key, value]) => (
          <li key={key} className="flex justify-between text-gray-300">
            <strong className="capitalize">{key}:</strong> 
            <span>{value as number}/100</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="AuditTrail.tsx">
import React from 'react';
import { motion } from 'framer-motion';

export default function AuditTrail({ audit }: { audit: any[] }) {
  return (
    <motion.div 
      className="mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-bold text-green-400 mb-3">Audit Trail</h3>
      <ul className="space-y-2 text-sm text-gray-300">
        {audit.map((a, i) => (
          <li key={i} className="flex items-center">
            <span className="mr-2 text-gray-500">[{new Date(a.timestamp).toLocaleTimeString()}]</span>
            <span className="font-medium">{a.userId}:</span>
            <span className="ml-1">{a.action}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="ProjectOverview.tsx">
import React from 'react';
import { useAiStore } from '../stores/aiStore';
import { motion } from 'framer-motion';

export default function ProjectOverview() {
  const { messages, projectPath } = useAiStore();
  const lastScore = messages.slice().reverse().find(m => m.score)?.score;

  return (
    <motion.div 
      className="bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-700"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="font-semibold mb-3">Project Overview</h3>
      <div className="space-y-2 text-sm text-gray-300">
        <p><strong>Path:</strong> {projectPath}</p>
        <p><strong>Tasks Completed:</strong> {messages.filter(m => m.type === 'ai').length}</p>
        {lastScore && (
          <p><strong>Latest Score:</strong> {lastScore.global}/100</p>
        )}
      </div>
    </motion.div>
  );
}
</DOCUMENT>

<DOCUMENT filename="aiStore.ts">
// src/stores/aiStore.ts
import { create } from 'zustand';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  diffs?: any[];
  score?: any;
  audit?: any[];
  validation?: any;
  context?: any[];
}

interface AiState {
  messages: Message[];
  projectPath: string;
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setProjectPath: (path: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAiStore = create<AiState>((set) => ({
  messages: [],
  projectPath: './project',
  isLoading: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setProjectPath: (path) => set({ projectPath: path }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
</DOCUMENT>

<DOCUMENT filename="aiApi.ts">
import axios from 'axios';

export const executeGoal = async (goal: string, userId: string, projectPath: string) => {
  const res = await axios.post('http://localhost:3333/ai/execute', { goal, userId, projectPath });
  return res.data;
};

export const voteDiff = async (file: string, approve: boolean, userId: string) => {
  return axios.post('http://localhost:3333/collaboration/vote', { file, approve, userId });
};
</DOCUMENT>

<DOCUMENT filename="index.tsx">
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
</DOCUMENT>

<DOCUMENT filename="vite-env.d.ts">
/// <reference types="vite/client" />
</DOCUMENT>