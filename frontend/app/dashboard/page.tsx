'use client';

import { useState } from 'react';
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
import { 
  MessageSquare, FileText, Code, 
  ClipboardList, GraduationCap, Headphones, 
  BarChart2, Award, CalendarDays, Eye 
} from 'lucide-react';
type Tab = 'chat' | 'documents' | 'assessments' | 'analytics' | 'attention' | 'code' | 'planner' | 'badges' | 'podcast' | 'protege';

const tabGroups = [
  {
    label: 'Core',
    tabs: [
      { id: 'chat' as Tab, label: 'Chat', icon: <MessageSquare size={15} strokeWidth={2.5} /> },
      { id: 'documents' as Tab, label: 'Docs', icon: <FileText size={15} strokeWidth={2.5} /> },
      { id: 'code' as Tab, label: 'Code', icon: <Code size={15} strokeWidth={2.5} /> },
    ],
  },
  {
    label: 'Learn',
    tabs: [
      { id: 'assessments' as Tab, label: 'Quiz', icon: <ClipboardList size={15} strokeWidth={2.5} /> },
      { id: 'protege' as Tab, label: 'Teach', icon: <GraduationCap size={15} strokeWidth={2.5} /> },
      { id: 'podcast' as Tab, label: 'Audio', icon: <Headphones size={15} strokeWidth={2.5} /> },
    ],
  },
  {
    label: 'Track',
    tabs: [
      { id: 'analytics' as Tab, label: 'Stats', icon: <BarChart2 size={15} strokeWidth={2.5} /> },
      { id: 'badges' as Tab, label: 'Badges', icon: <Award size={15} strokeWidth={2.5} /> },
      { id: 'planner' as Tab, label: 'Plan', icon: <CalendarDays size={15} strokeWidth={2.5} /> },
      { id: 'attention' as Tab, label: 'Focus', icon: <Eye size={15} strokeWidth={2.5} /> },
    ],
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "var(--font-outfit), system-ui, sans-serif",
      }}
    >
      {/* Top Header */}
      <header
        className="glass"
        style={{
          position: 'relative',
          zIndex: 100,
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          padding: '0 1.25rem',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <a
            href="/"
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '-0.02em',
              color: 'hsl(220 15% 90%)',
              textDecoration: 'none',
            }}
          >
            GuruCortex
          </a>
          <span
            style={{
              fontSize: '0.68rem',
              color: 'hsl(220 10% 42%)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              paddingLeft: '0.6rem',
              marginLeft: '0.2rem',
            }}
          >
            Dashboard
          </span>
        </div>

        {/* Tab Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            overflowX: 'auto',
          }}
        >
          {tabGroups.map((group, gi) => (
            <div key={group.label} style={{ display: 'flex', alignItems: 'center' }}>
              {gi > 0 && (
                <div
                  style={{
                    width: 1,
                    height: 18,
                    background: 'rgba(255,255,255,0.08)',
                    margin: '0 0.4rem',
                  }}
                />
              )}
              {group.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="rounded-full"
                  style={{
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    fontFamily: "var(--font-outfit), sans-serif",
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    background: activeTab === tab.id
                      ? 'rgba(80,120,255,0.14)'
                      : 'transparent',
                    color: activeTab === tab.id
                      ? 'hsl(220 80% 75%)'
                      : 'hsl(220 10% 48%)',
                    border: activeTab === tab.id
                      ? '1px solid rgba(80,120,255,0.28)'
                      : '1px solid transparent',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: activeTab === tab.id ? 1 : 0.7 }}>{tab.icon}</span>
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AccessibilityToggle />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'chat' && <ChatInterface />}

        {activeTab === 'documents' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'hsl(220 10% 40%)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Knowledge Base
                </span>
                <h2
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'hsl(220 15% 90%)',
                    letterSpacing: '-0.02em',
                    marginTop: '0.3rem',
                  }}
                >
                  Document Manager
                </h2>
                <p style={{ color: 'hsl(220 10% 50%)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                  Upload study materials (PDF, DOCX, PPTX, TXT) to build your knowledge base.
                </p>
              </div>
              <DocumentUploader />
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <CodeSandbox />
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <AssessmentHub />
            </div>
          </div>
        )}

        {activeTab === 'protege' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <ProtegeMode />
            </div>
          </div>
        )}

        {activeTab === 'podcast' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <PodcastPlayer />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <LearningDashboard />
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <BadgesDisplay />
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <StudyPlanner />
            </div>
          </div>
        )}

        {activeTab === 'attention' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'hsl(220 10% 40%)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Monitoring
                </span>
                <h2
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'hsl(220 15% 90%)',
                    letterSpacing: '-0.02em',
                    marginTop: '0.3rem',
                  }}
                >
                  Focus & Attention
                </h2>
              </div>
              <AttentionMonitor />
              <div
                className="glass-card"
                style={{ padding: '1.25rem' }}
              >
                <h3
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'hsl(220 15% 88%)',
                    marginBottom: '1rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Voice Input
                </h3>
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
    </div>
  );
}

