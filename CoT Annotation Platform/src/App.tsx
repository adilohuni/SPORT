import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LeftPanel } from './components/LeftPanel';
import { StepEditor } from './components/StepEditor';
import { CommentSidebar } from './components/CommentSidebar';
import { ExportModal } from './components/ExportModal';
import { saveRun } from './utils/storage';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

// Types
export type Theme = 'light' | 'dark' | 'high-contrast';
export type Status = 'draft' | 'in-review' | 'approved' | 'archived';

export interface ThoughtData {
  id: string;
  content: string;
  annotations: Array<{ start: number; end: number; correction: string }>;
}

export interface StepData {
  id: string;
  nodeId: string;
  prompt: string;
  thoughts: [ThoughtData, ThoughtData, ThoughtData];
  qualityScore: number;
  subtask?: string;
  validated: boolean;
  validationIssues: string[];
}

export interface Comment {
  id: string;
  stepId: string;
  author: string;
  content: string;
  timestamp: Date;
  replies: Comment[];
}

export interface VersionEntry {
  timestamp: Date;
  author: string;
  changes: string;
  data: StepData;
}

export interface RunData {
  id: string;
  title: string;
  status: Status;
  steps: StepData[];
  comments: Comment[];
  versionHistory: Record<string, VersionEntry[]>;
  lastModified: Date;
}

function App() {
  // URL parameters
  const [urlParams] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      runId: params.get('agentRunId') || params.get('runId') || 'demo-run-1',
      taskId: params.get('taskId') || null,
      isReviewerMode: params.get('qa') === 'true',
    };
  });

  // State management
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });
  
  const [currentRun, setCurrentRun] = useState<RunData | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(() => {
    // Auto-collapse on mobile
    return window.innerWidth < 768;
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Load demo data on mount
  useEffect(() => {
    const demoRun: RunData = {
      id: urlParams.runId,
      title: 'Chain-of-Thought Annotation Run #47',
      status: urlParams.isReviewerMode ? 'in-review' : 'draft',
      lastModified: new Date(),
      comments: [
        {
          id: 'c1',
          stepId: 'step-1',
          author: 'Alice',
          content: 'This reasoning step needs more detail',
          timestamp: new Date(Date.now() - 3600000),
          replies: [
            {
              id: 'c1-r1',
              stepId: 'step-1',
              author: 'Bob',
              content: 'Agreed, I will expand it',
              timestamp: new Date(Date.now() - 1800000),
              replies: [],
            },
          ],
        },
      ],
      versionHistory: {},
      steps: Array.from({ length: 12 }, (_, i) => ({
        id: `step-${i + 1}`,
        nodeId: `node_step_${i + 1}`,
        prompt: `Analyze the following scenario and provide reasoning:\n\nScenario ${i + 1}: A user is trying to optimize their workflow. What steps should they consider?`,
        thoughts: [
          {
            id: `thought-${i}-1`,
            content: `First, we need to identify the current bottlenecks in the workflow. This involves analyzing time spent on each task and finding patterns.`,
            annotations: [],
          },
          {
            id: `thought-${i}-2`,
            content: `Second, we should prioritize improvements based on impact and effort required. Quick wins should be tackled first.`,
            annotations: [],
          },
          {
            id: `thought-${i}-3`,
            content: `Finally, we implement changes incrementally and measure results to ensure the optimizations are effective.`,
            annotations: [],
          },
        ],
        qualityScore: 65 + Math.floor(Math.random() * 30),
        subtask: i < 4 ? 'Analysis Phase' : i < 8 ? 'Reasoning Phase' : 'Conclusion Phase',
        validated: i < 5,
        validationIssues: i >= 5 ? ['Missing key reasoning step', 'Needs more specific examples'] : [],
      })),
    };
    
    setCurrentRun(demoRun);
  }, [urlParams.runId, urlParams.isReviewerMode]);

  // Theme persistence
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auto-save simulation
  useEffect(() => {
    if (currentRun && autoSaveStatus === 'unsaved') {
      setAutoSaveStatus('saving');
      const timer = setTimeout(() => {
        setAutoSaveStatus('saved');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentRun, autoSaveStatus]);

  const handleStepUpdate = (stepIndex: number, updatedStep: StepData) => {
    if (!currentRun) return;
    
    const newSteps = [...currentRun.steps];
    newSteps[stepIndex] = updatedStep;
    
    setCurrentRun({
      ...currentRun,
      steps: newSteps,
      lastModified: new Date(),
    });
    setAutoSaveStatus('unsaved');
  };

  const handleStatusChange = (newStatus: Status) => {
    if (!currentRun) return;
    setCurrentRun({ ...currentRun, status: newStatus });
    setAutoSaveStatus('unsaved');
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!currentRun) return;
    if (direction === 'prev' && activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    } else if (direction === 'next' && activeStepIndex < currentRun.steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };

  const filteredSteps = currentRun?.steps.filter(step =>
    step.nodeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const activeStep = currentRun?.steps[activeStepIndex];

  return (
    <div className={`min-h-screen transition-colors duration-200`}>
      <Header
        run={currentRun}
        theme={theme}
        onThemeChange={setTheme}
        onStatusChange={handleStatusChange}
        onToggleComments={() => setShowComments(!showComments)}
        onExport={() => setShowExport(true)}
        autoSaveStatus={autoSaveStatus}
        isReviewerMode={urlParams.isReviewerMode}
        onToggleMenu={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel */}
        <div
          className={`${
            leftPanelCollapsed ? 'hidden md:hidden' : 'fixed md:relative inset-0 top-16 md:top-0 z-30 md:z-0 w-full md:w-[30%]'
          } transition-all duration-300 border-r overflow-hidden bg-background`}
        >
          <LeftPanel
            steps={filteredSteps}
            allSteps={currentRun?.steps || []}
            activeStepIndex={activeStepIndex}
            onStepSelect={setActiveStepIndex}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSaveLocally={() => {
              if (currentRun) {
                saveRun(currentRun);
                toast.success('Run saved to local storage');
              }
            }}
            collapsed={leftPanelCollapsed}
            onToggleCollapse={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          />
        </div>

        {/* Right Panel */}
        <div className="flex-1 overflow-auto">
          {activeStep && (
            <StepEditor
              step={activeStep}
              stepIndex={activeStepIndex}
              totalSteps={currentRun?.steps.length || 0}
              onUpdate={(updatedStep) => handleStepUpdate(activeStepIndex, updatedStep)}
              onNavigate={handleNavigate}
              versionHistory={currentRun?.versionHistory[activeStep.id] || []}
            />
          )}
        </div>

        {/* Comment Sidebar */}
        {showComments && activeStep && (
          <CommentSidebar
            comments={currentRun?.comments.filter(c => c.stepId === activeStep.id) || []}
            onClose={() => setShowComments(false)}
            onAddComment={(content) => {
              if (!currentRun || !activeStep) return;
              const newComment: Comment = {
                id: `c-${Date.now()}`,
                stepId: activeStep.id,
                author: 'Current User',
                content,
                timestamp: new Date(),
                replies: [],
              };
              setCurrentRun({
                ...currentRun,
                comments: [...currentRun.comments, newComment],
              });
            }}
          />
        )}
      </div>

      {/* Export Modal */}
      {showExport && currentRun && (
        <ExportModal
          run={currentRun}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Toaster */}
      <Toaster />
    </div>
  );
}

export default App;