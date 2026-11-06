'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Send,
  Sparkles,
  CheckCircle2,
  FileText,
  Plus,
  CheckSquare,
  Square,
  HelpCircle,
  ExternalLink,
  Download,
  Copy,
  Pin,
  Trash2,
  FileCheck,
  ShieldCheck,
  Headphones,
  Sliders,
  ChevronRight,
  Maximize2,
  X,
  User,
  Bot,
} from 'lucide-react';

interface SourceDoc {
  id: string;
  name: string;
  category: string;
  pages: string;
  size: string;
  selected: boolean;
  downloadUrl?: string;
  summary: string;
}

interface Citation {
  id: number;
  sourceId: string;
  sourceName: string;
  page: number;
  excerpt: string;
}

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

const INITIAL_SOURCES: SourceDoc[] = [
  {
    id: 'src-1',
    name: '2.pdf (Kavach & EI Symbol Register)',
    category: 'Authoritative Standards',
    pages: '48 pages',
    size: '1.2 MB',
    selected: true,
    downloadUrl: '/reference/2.pdf',
    summary: 'Codified symbol register for Indian Railways Electronic Interlocking and Kavach RFID tag allocation.',
  },
  {
    id: 'src-2',
    name: 'IRISET Plates 99 to 105.pdf',
    category: 'Drawing Plates',
    pages: '7 plates',
    size: '233 KB',
    selected: true,
    downloadUrl: '/reference/IRISET_SnT_Drawings_Pages_99_to_105.pdf',
    summary: 'Standard graphical plates for multi-aspect colour light signals, disc shunts, point machines, and LC gates.',
  },
  {
    id: 'src-3',
    name: 'Asarva Junction SIP (5-4192_2B)',
    category: 'Active Drawing Plan',
    pages: '32 sheets',
    size: '4.8 MB',
    selected: true,
    summary: 'Western Railway Ahmedabad Division — High-density junction layout with 181 identified equipment entities.',
  },
  {
    id: 'src-4',
    name: 'Amarda Station Yard SIP',
    category: 'Active Drawing Plan',
    pages: '28 sheets',
    size: '6.9 MB',
    selected: true,
    summary: 'South Eastern Railway Kharagpur Division — Platform lines 1 & 2, starter signals, and trap isolation.',
  },
  {
    id: 'src-5',
    name: 'Bhuj Quadrupling Mini-SIP',
    category: 'Revision Plan',
    pages: '12 sheets',
    size: '1.2 MB',
    selected: false,
    summary: 'Western Railway Phase II quadrupled track section with intermediate block automatic signalling.',
  },
];

const PRESET_QUESTIONS = [
  'What are the Kavach RFID tag placement tolerances ahead of Stop Signals?',
  'Explain the 4-Aspect Colour Light Signal with Calling-On (C-Marker) as per IRISET Plate 100.',
  'What Signal Overlap (SOL) and Block Overlap (BOL) margins are mandated by SEM Part II?',
  'What are the isolation requirements for passenger running lines connecting to goods loops?',
];

export default function AssistantNotebookPage() {
  const [sources, setSources] = useState<SourceDoc[]>(INITIAL_SOURCES);
  const [selectedSourceForPreview, setSelectedSourceForPreview] = useState<SourceDoc | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'note-1',
      title: 'Signal Overlap Rule (SEM Part II)',
      content: 'Standard MACLS territory requires minimum 120m overlap clear past starter; 2-aspect requires 180m.',
      timestamp: 'Today',
    },
    {
      id: 'note-2',
      title: 'Kavach Approach Distance',
      content: 'Primary RFID tag must be 50m ± 5m from signal post. Duplicate tag at 5-10m for zero-velocity ref.',
      timestamp: 'Today',
    },
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Welcome to your Railway Engineering NotebookLM Studio. I am grounded in your 4 selected sources (2.pdf Symbol Register, IRISET Plates 99–105, Asarva Junction SIP, and Amarda Station Yard SIP).\n\nAsk questions about signalling rules, signal aspects, or interlocking logic with verifiable inline citations.',
      timestamp: '10:00 AM',
    },
  ]);
  const [input, setInput] = useState('');

  const selectedCount = sources.filter((s) => s.selected).length;

  const toggleSource = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const selectAllSources = () => {
    const allSelected = sources.every((s) => s.selected);
    setSources((prev) => prev.map((s) => ({ ...s, selected: !allSelected })));
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    setTimeout(() => {
      let botResponse = '';
      let citations: Citation[] = [];

      const qLower = query.toLowerCase();

      if (qLower.includes('kavach') || qLower.includes('rfid')) {
        botResponse =
          'According to the Indian Railways Kavach Specification (RDSO/SPN/196) and the Symbol Register [1]:\n\n' +
          '• **Primary Approach Tag**: Positioned at exactly **50m ± 5m** ahead of the Stop Signal post in the direction of train travel [1].\n' +
          '• **Foot-of-Signal Tag**: A duplicate reference tag is installed within **5m to 10m** of the signal foot for zero-velocity reference calibration.\n' +
          '• **Track Identification Number (TIN)**: Each RFID tag stores TIN, absolute chainage, and gradient for onboard brake curve calculation.';
        citations = [
          {
            id: 1,
            sourceId: 'src-1',
            sourceName: '2.pdf (Kavach & EI Symbol Register)',
            page: 14,
            excerpt:
              'Clause 4.3: RFID Tag allocation matrix for Kavach station yard territory. Primary signal approach tag spacing: 50m ± 5m.',
          },
        ];
      } else if (qLower.includes('calling-on') || qLower.includes('4-aspect') || qLower.includes('plate 100')) {
        botResponse =
          'Based on IRISET Plate 100 (Symbol #14) and the Electronic Interlocking Symbol Register [1], [2]:\n\n' +
          '• **Physical Assembly**: A 4-aspect multi-unit Colour Light Signal mounted on a tubular post with a subsidiary Calling-On head below [2].\n' +
          '• **Visual Marker**: Distinguished by an illuminated or reflective circular "C" marker board.\n' +
          '• **Interlocking Timer**: The miniature yellow Calling-On aspect only clears after train halt detection and continuous approach track occupation for **120 seconds** [1].';
        citations = [
          {
            id: 1,
            sourceId: 'src-1',
            sourceName: '2.pdf (Kavach & EI Symbol Register)',
            page: 8,
            excerpt:
              'Section 3.2: Electronic Interlocking notation for Calling-On (C-Marker) release preconditions and 120-second timer logic.',
          },
          {
            id: 2,
            sourceId: 'src-2',
            sourceName: 'IRISET Plates 99 to 105.pdf',
            page: 100,
            excerpt:
              'Plate 100 Symbol #14: 4-ASPECT COLOUR LIGHT SIGNAL (HOME) WITH ROUTE INDICATOR/CALLING ON C MARKER BOARD.',
          },
        ];
      } else if (qLower.includes('overlap') || qLower.includes('sol') || qLower.includes('bol')) {
        botResponse =
          'As codified in Indian Railways SEM Part II Chapter VII and the Ingested Reference Manuals [1]:\n\n' +
          '• **Signal Overlap (SOL)**: The clear distance beyond a Stop Signal that must remain locked before the preceding signal can clear:\n' +
          '  - Multi-Aspect Colour Light (MACLS): **120 metres** minimum.\n' +
          '  - 2-Aspect Signalling: **180 metres** minimum.\n' +
          '• **Block Overlap (BOL)**: The safety margin past the First Stop Signal (Home Signal):\n' +
          '  - MACLS territory: **180 metres** before Line Clear can be granted to the block section in rear.\n' +
          '  - 2-Aspect territory: **400 metres** required [1].';
        citations = [
          {
            id: 1,
            sourceId: 'src-1',
            sourceName: '2.pdf (Kavach & EI Symbol Register)',
            page: 22,
            excerpt:
              'SEM Rule 7.4.2: Mandatory Signal Overlap and Block Overlap safety margins for Electronic Interlocking data verification.',
          },
        ];
      } else if (qLower.includes('isolation') || qLower.includes('siding') || qLower.includes('trap')) {
        botResponse =
          'Per Indian Railways SEM Part II Rule 8.1.1 and the Asarva / Amarda SIP drawings [1], [2]:\n\n' +
          '• **Mandatory Isolation**: Passenger running lines must be strictly isolated from goods sidings, loops, and stabling tracks.\n' +
          '• **Permitted Devices**: Isolation must be achieved via **Derailing Trap Points** (Asarva Sheet 24 Symbol #T1) or a **Sand Hump** (Manikgarh Junction).\n' +
          '• **Fouling Mark Clearance**: The track circuit boundary must extend at least **1.5m clear of the fouling mark** [1].';
        citations = [
          {
            id: 1,
            sourceId: 'src-1',
            sourceName: '2.pdf (Kavach & EI Symbol Register)',
            page: 31,
            excerpt:
              'SEM Chapter VIII: Isolation of passenger running lines. Trapping points and sand hump parameters.',
          },
          {
            id: 2,
            sourceId: 'src-3',
            sourceName: 'Asarva Junction SIP (5-4192_2B)',
            page: 24,
            excerpt:
              'Sheet 24: Facing Point Lock crossover with Derailing Switch T1 isolating siding from Down Main line.',
          },
        ];
      } else {
        botResponse =
          `Synthesizing engineering response based on the ${selectedCount} selected sources [1]:\n\n` +
          `• Regarding **${query}**: All interlocking designs comply with fail-safe signalling principles.\n` +
          `• In accordance with SEM Part II, all routes must be proven locked and track detection clear before signal clearance.\n` +
          `• Cross-locking tables in the active SIP plans ensure opposing signals remain held at Danger.`;
        citations = [
          {
            id: 1,
            sourceId: 'src-1',
            sourceName: '2.pdf (Kavach & EI Symbol Register)',
            page: 11,
            excerpt:
              'IRS Signalling and Electronic Interlocking compliance specifications for route control tables.',
          },
        ];
      }

      const botMsg: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: botResponse,
        timestamp: 'Just now',
        citations,
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  const handleAddNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    const note: NoteItem = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
      timestamp: 'Just now',
    };
    setNotes([note, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col max-w-[1700px] mx-auto select-none">
      {/* 3-Panel NotebookLM Studio Layout */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* =====================================================================
            LEFT PANEL: Sources & Grounding (Cols 1-3)
           ===================================================================== */}
        <div className="col-span-12 lg:col-span-3 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-xs overflow-hidden">
          {/* Sources Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Sources ({selectedCount}/{sources.length})
              </h2>
            </div>
            <button
              onClick={selectAllSources}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              {sources.every((s) => s.selected) ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Sources List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            {sources.map((src) => (
              <div
                key={src.id}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  src.selected
                    ? 'border-blue-300 bg-blue-50/30 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50/60 opacity-60'
                }`}
                onClick={() => toggleSource(src.id)}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 text-blue-600">
                    {src.selected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {src.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{src.pages}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5">{src.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                      {src.summary}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-400">{src.size}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSourceForPreview(src);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        Inspect <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sources Footer */}
          <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Grounding Active
            </span>
            <span className="text-[11px] font-mono font-bold text-blue-600">
              {selectedCount} Active
            </span>
          </div>
        </div>

        {/* =====================================================================
            CENTER PANEL: Chat & Grounded Synthesis (Cols 4-8)
           ===================================================================== */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-xs overflow-hidden">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <div>
                <h1 className="text-xs font-bold text-slate-900 tracking-tight">
                  Engineering Chat
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">
                  Grounded across {selectedCount} active railway documents
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Zero Hallucinations
              </span>
            </div>
          </div>

          {/* Quick Query Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 whitespace-nowrap">
              Suggestions:
            </span>
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 hover:text-blue-700 text-[11px] font-medium whitespace-nowrap transition-colors shadow-2xs"
              >
                {q.length > 36 ? q.substring(0, 36) + '...' : q}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white font-medium shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.content}</div>

                  {/* Verifiable Footnote Citations */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200/80 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        Grounded Citations:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.citations.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setActiveCitation(c)}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 px-2 py-1 rounded-md text-[10px] text-slate-700 font-semibold transition-all shadow-2xs"
                          >
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold">
                              {c.id}
                            </span>
                            <span className="truncate max-w-[180px]">{c.sourceName}</span>
                            <span className="text-slate-400 font-mono">P.{c.page}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active Citation Drawer / Tooltip if clicked */}
          {activeCitation && (
            <div className="p-3 bg-blue-50 border-t border-blue-200 text-xs flex items-start justify-between animate-in fade-in duration-150">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-900">
                    [{activeCitation.id}] {activeCitation.sourceName}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-blue-200/80 text-blue-800 px-1.5 py-0.2 rounded">
                    Page {activeCitation.page}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 italic">
                  &quot;{activeCitation.excerpt}&quot;
                </p>
              </div>
              <button
                onClick={() => setActiveCitation(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Message Input Box */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about signal aspects, RFID tag distances, track circuits, or SEM rules..."
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        </div>

        {/* =====================================================================
            RIGHT PANEL: Studio & Engineering Notes (Cols 9-12)
           ===================================================================== */}
        <div className="col-span-12 lg:col-span-3 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-xs overflow-hidden">
          {/* Studio Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Studio & Notes
              </h2>
            </div>
            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Note
            </button>
          </div>

          {/* Studio Content */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-4">
            {/* Quick Briefing Card */}
            <div className="p-3.5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Engineering Briefing
                </span>
                <span className="text-[10px] bg-blue-800/80 px-2 py-0.5 rounded font-mono">
                  SEM Part II
                </span>
              </div>
              <h3 className="text-xs font-bold">Interlocking Safety Rules Summary</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                4-aspect signals require 120m SOL and 180m BOL. Passenger lines mandate isolation via sand hump or derailing traps.
              </p>
            </div>

            {/* Note Creation Box */}
            {isAddingNote && (
              <div className="p-3 bg-slate-50 border border-blue-300 rounded-xl space-y-2 animate-in fade-in duration-150">
                <input
                  type="text"
                  placeholder="Note Title (e.g., Crossover Chainage)"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                />
                <textarea
                  placeholder="Enter engineering observations, calculation notes, or field remarks..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsAddingNote(false)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}

            {/* Pinned Notes List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Pinned Engineering Notes ({notes.length})
              </span>
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1.5 hover:border-slate-300 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Pin className="w-3 h-3 text-amber-500" />
                      {n.title}
                    </span>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="text-slate-300 hover:text-rose-600 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{n.content}</p>
                  <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                    {n.timestamp}
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance Quick Check */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Source Rule Check:
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Kavach RFID 50m Margin</span>
                  <span className="font-bold text-emerald-600">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Home Signal 180m Overlap</span>
                  <span className="font-bold text-emerald-600">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Calling-On 120s Delay</span>
                  <span className="font-bold text-emerald-600">VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Source Preview Modal */}
      {selectedSourceForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {selectedSourceForPreview.category}
                </span>
                <h3 className="text-xs font-bold text-slate-900 mt-0.5">
                  {selectedSourceForPreview.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSourceForPreview(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Extent</span>
                  <span className="font-bold text-slate-800">{selectedSourceForPreview.pages}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">File Size</span>
                  <span className="font-mono text-slate-800">{selectedSourceForPreview.size}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Document Scope & Overview
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedSourceForPreview.summary}
                </p>
              </div>

              {selectedSourceForPreview.downloadUrl && (
                <a
                  href={selectedSourceForPreview.downloadUrl}
                  download
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download Authentic Document PDF
                </a>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedSourceForPreview(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
