
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Settings, 
  ScanSearch, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Menu,
  X,
  FileText,
  Key
} from 'lucide-react';
import { Job, BookingParams } from './types';
import Dashboard from './components/Dashboard';
import BookingForm from './BookingForm.jsx';
import JobHistory from './components/JobHistory';
import AiInspector from './components/AiInspector';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'booking' | 'history' | 'ai'>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>('https://script.google.com/macros/s/AKfycbxUCj3Pek5fYXDM-osRsxsf3nat9Gep-j_gadk2mz2hKbfbtC10bpWMjZn3cexm0mE5Tg/exec');
  const [hasKey, setHasKey] = useState<boolean>(false);

  // Load jobs from local storage for persistence in demo
  useEffect(() => {
    const savedJobs = localStorage.getItem('flash_fix_jobs');
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    }

    // Check if API key is already selected
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // Assume success as per instructions to avoid race condition
      setHasKey(true);
    }
  };

  const saveJobs = (newJobs: Job[]) => {
    setJobs(newJobs);
    localStorage.setItem('flash_fix_jobs', JSON.stringify(newJobs));
  };

  const addJob = (job: Job) => {
    const updatedJobs = [job, ...jobs];
    saveJobs(updatedJobs);
  };

  const updateJobStatus = (id: string, status: Job['status']) => {
    const updatedJobs = jobs.map(j => j.id === id ? { ...j, status } : j);
    saveJobs(updatedJobs);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'booking', label: 'New Booking', icon: PlusCircle },
    { id: 'ai', label: 'AI Inspector', icon: ScanSearch },
    { id: 'history', label: 'Job Logs', icon: History },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shrink-0">
            FF
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">Flash Fix <span className="text-blue-400">Pro</span></span>
          )}
        </div>

        <nav className="flex-1 mt-4 px-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="shrink-0" size={24} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {!hasKey && isSidebarOpen && (
            <div className="bg-blue-900/50 p-3 rounded-xl border border-blue-700/50 mb-2">
              <p className="text-[10px] text-blue-300 uppercase font-bold mb-2">API Setup Required</p>
              <button 
                onClick={handleSelectKey}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Key size={12} /> Select API Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-[10px] text-blue-400 mt-2 text-center hover:underline"
              >
                Billing Documentation
              </a>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-4 px-3 py-3 text-slate-400 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            {isSidebarOpen && <span className="font-medium">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-8 z-40">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {activeTab.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            {hasKey && (
              <button 
                onClick={handleSelectKey}
                className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-100 px-3 py-1.5 rounded-full transition-colors"
              >
                <Key size={14} /> Change Project Key
              </button>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">Admin User</p>
              <p className="text-xs text-slate-500">Flash Fix Ecosystem</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold">
              A
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard jobs={jobs} setActiveTab={setActiveTab} />}
          {activeTab === 'booking' && (
            <BookingForm 
              onSuccess={addJob} 
              webhookUrl={webhookUrl} 
              setWebhookUrl={setWebhookUrl} 
            />
          )}
          {activeTab === 'ai' && <AiInspector />}
          {activeTab === 'history' && (
            <JobHistory 
              jobs={jobs} 
              updateJobStatus={updateJobStatus} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
