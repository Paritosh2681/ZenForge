import re

file_path = 'c:/Users/Abhishek/Downloads/ZenForge/frontend/app/dashboard/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

new_tabs = '''const tabs: { id: Tab; label: string; icon: React.ReactNode; group: string }[] = [
  { id: 'chat', label: 'Chat', icon: <MessageSquare size={16} />, group: 'core' },
  { id: 'documents', label: 'Docs', icon: <FileText size={16} />, group: 'core' },
  { id: 'code', label: 'Code', icon: <Code size={16} />, group: 'core' },
  { id: 'assessments', label: 'Quiz', icon: <CheckSquare size={16} />, group: 'learn' },
  { id: 'protege', label: 'Teach', icon: <Presentation size={16} />, group: 'learn' },
  { id: 'podcast', label: 'Audio', icon: <Headphones size={16} />, group: 'learn' },
  { id: 'analytics', label: 'Stats', icon: <BarChart size={16} />, group: 'track' },
  { id: 'badges', label: 'Badges', icon: <Trophy size={16} />, group: 'track' },
  { id: 'planner', label: 'Plan', icon: <Calendar size={16} />, group: 'track' },
  { id: 'attention', label: 'Focus', icon: <Eye size={16} />, group: 'track' },
];'''

# Replace tabs array
text = re.sub(r'const tabs:.*?\];', new_tabs, text, flags=re.DOTALL)

# Replace <header> to be more premium
new_header = '''
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-[#0a0f1c]/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between shrink-0 shadow-sm relative z-50">
        <div className="flex items-center gap-4 shrink-0">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]">
                <span className="font-bold text-sm">GC</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white hidden sm:block">GuruCortex</span>
            </a>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full hidden md:inline-flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>STUDIO</span>
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
                  className={px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-2 shrink-0 whitespace-nowrap \}
                  title={tab.label}
                >
                  <span className={\\\}>{tab.icon}</span>
                  <span className="hidden lg:inline sm:block">{tab.label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <AccessibilityToggle />
          <button className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </header>'''

# Replace header block
text = re.sub(r'\{\/\* Top Navigation \*\/\}.*?<\/header>', new_header, text, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
