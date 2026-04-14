'use client';

import { useState } from 'react';
import { MessageSquare, FileText, Code, CheckSquare, Presentation, Headphones, BarChart, Trophy, Calendar, Eye, Moon, Sun, ArrowRight, LogOut } from 'lucide-react';

import ChatInterface from '@/components/ChatInterface';
import DocumentUploader from '@/components/DocumentUploader';
import AttentionMonitor from '@/components/AttentionMonitor';
import VoiceInput from '@/components/VoiceInput';
import AssessmentHub from '@/components/AssessmentHub';
import LearningDashboard from '@/components/LearningDashboard';
import CodeSandbox from '@/components/CodeSandbox';
import StudyPlanner from '@/components/StudyPlanner';
import BadgesDisplay from '@/components/BadgesDisplay';
import PodcastPlayer from '@/components/PodcastPlayer';
import ProtegeMode from '@/components/ProtegeMode';
import AccessibilityToggle from '@/components/AccessibilityToggle';
import EyeDetectionOverlay from '@/components/EyeDetectionOverlay';

type Tab = 'chat' | 'documents' | 'assessments' | 'analytics' | 'attention' | 'code' | 'planner' | 'badges' | 'podcast' | 'protege';

const tabs: { id: Tab; label: string; icon: React.ReactNode; group: string }[] = [
  { id: 'chat', label: 'Chat', icon: <MessageSquare size={16} />, group: 'core' },
  { id: 'documents', label: 'Docs', icon: <FileText size={16} />, group: 'core' },
  { id: 'code', label: 'Code', icon: <Code size={16} />, group: 'core' },
  { id: 'assessments', label: 'Quiz', icon: <CheckSquare size={16} />, group: 'learn' },
  { id: 'protege', label: 'Teach', icon: <Presentation size={16} />, group: 'learn' },
  { id: 'podcast', label: 'Audio', icon: <Headphones size={16} />, group: 'learn' },
  { id: 'analytics', label: 'Stats', icon: <BarChart size={16} />, group: 'track' },
  { id: 'badges', label: 'Badges', icon: <Trophy size={16} />, group: 'track' },
  { id: 'planner', label: 'Plan', icon: <Calendar size={16} />, group: 'track' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [selectedDocumentNames, setSelectedDocumentNames] = useState<string[]>([]);

  const handleSelectedDocumentsChange = (documentIds: string[], documentNames: string[]) => {
    setSelectedDocumentIds(documentIds);
    setSelectedDocumentNames(documentNames);
  };

  const handleOpenChatForDocuments = (documentIds: string[], documentNames?: string[]) => {
    setSelectedDocumentIds(documentIds);
    if (documentNames) {
      setSelectedDocumentNames(documentNames);
    }
    setActiveTab('chat');
  };

  const handleClearDocumentScope = () => {
    setSelectedDocumentIds([]);
    setSelectedDocumentNames([]);
  };

  return (
    <div className="h-screen flex flex-col bg-[rgb(var(--bg-base))]">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-[#0D0D0D] backdrop-blur-xl px-4 py-3 flex items-center justify-between shrink-0 shadow-sm relative z-50">
        <div className="flex items-center gap-4 shrink-0">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="font-extrabold text-xl tracking-tight text-white hidden sm:block">GuruCortex</span>
            </a>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded-full hidden md:inline-flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse"></div>STUDIO</span>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto mx-4 scrollbar-hide">
          {tabs.map((tab, i) => {
            const prevGroup = i > 0 ? tabs[i - 1].group : tab.group;
            return (
              <div key={tab.id} className="flex items-center">
                {tab.group !== prevGroup && i > 0 && (
                  <div className="w-px h-4 bg-white/10 mx-1.5 shrink-0" />
                )}
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-2 shrink-0 whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                  title={tab.label}
                >
                  <span className={`${activeTab === tab.id ? 'text-[#22C55E] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'text-slate-500'}`}>
                    {tab.icon}
                  </span>
                  <span className="hidden lg:inline sm:block">{tab.label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <AccessibilityToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <ChatInterface
            selectedDocumentIds={selectedDocumentIds}
            selectedDocumentNames={selectedDocumentNames}
            onClearDocumentScope={handleClearDocumentScope}
          />
        )}

        {activeTab === 'documents' && (
          <div className="h-full overflow-y-auto p-6 bg-[rgb(var(--bg-base))]">
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-display font-semibold tracking-tight text-white mb-2">Document Manager</h2>
                <p className="text-sm leading-relaxed text-[#A1A1AA] font-normal">Upload study materials (PDF, DOCX, PPTX, TXT) to build your knowledge base.</p>
              </div>
              <DocumentUploader
                selectedDocumentIds={selectedDocumentIds}
                onSelectionChange={handleSelectedDocumentsChange}
                onOpenChatForDocuments={handleOpenChatForDocuments}
              />
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="h-full overflow-y-auto p-6 bg-[rgb(var(--bg-base))]">
            <div className="max-w-4xl mx-auto">
              <CodeSandbox />
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="h-full overflow-y-auto p-6 bg-[rgb(var(--bg-base))]">
            <div className="max-w-4xl mx-auto">
              <AssessmentHub
                selectedDocumentIds={selectedDocumentIds}
                selectedDocumentNames={selectedDocumentNames}
              />
            </div>
          </div>
        )}

        {activeTab === 'protege' && (
          <div className="h-full overflow-y-auto p-6 bg-[rgb(var(--bg-base))]">
            <div className="max-w-3xl mx-auto">
              <ProtegeMode />
            </div>
          </div>
        )}

        {activeTab === 'podcast' && (
          <div className="h-full overflow-y-auto p-6 bg-[rgb(var(--bg-base))]">
            <div className="max-w-3xl mx-auto">
              <PodcastPlayer />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="h-full overflow-y-auto p-6 bg-[rgb(var(--bg-base))]">
            <div className="max-w-6xl mx-auto">
              <LearningDashboard />
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="h-full overflow-y-auto p-6 bg-[rgb(var(--bg-base))]">
            <div className="max-w-4xl mx-auto">
              <BadgesDisplay />
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="h-full overflow-y-auto p-6 bg-[rgb(var(--bg-base))]">
            <div className="max-w-4xl mx-auto">
              <StudyPlanner />
            </div>
          </div>
        )}

        {activeTab === 'attention' && (
          <div className="h-full overflow-y-auto p-6 bg-[rgb(var(--bg-base))]">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold">Focus & Attention</h2>
              <AttentionMonitor />
              <div className="gc-card p-6">
                <h3 className="font-semibold mb-3 text-white">Voice Input</h3>
                <VoiceInput
                  onTranscription={(text, lang) => {
                    console.log('Transcription:', text, lang);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Eye Detection - always active overlay on dashboard */}
      <EyeDetectionOverlay />
    </div>
  );
}
