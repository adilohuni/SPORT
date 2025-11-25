import { Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { StepData } from '../App';
import { SearchBar } from './SearchBar';
import { StepNode } from './StepNode';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface LeftPanelProps {
  steps: StepData[];
  allSteps: StepData[];
  activeStepIndex: number;
  onStepSelect: (index: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSaveLocally: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function LeftPanel({
  steps,
  allSteps,
  activeStepIndex,
  onStepSelect,
  searchQuery,
  onSearchChange,
  onSaveLocally,
  collapsed,
  onToggleCollapse,
}: LeftPanelProps) {
  // Group steps by subtask
  const groupedSteps = steps.reduce((acc, step, idx) => {
    const subtask = step.subtask || 'Other';
    if (!acc[subtask]) {
      acc[subtask] = [];
    }
    const originalIndex = allSteps.findIndex(s => s.id === step.id);
    acc[subtask].push({ step, originalIndex });
    return acc;
  }, {} as Record<string, Array<{ step: StepData; originalIndex: number }>>);

  const hasSubtasks = Object.keys(groupedSteps).length > 1;
  
  // Calculate progress
  const validatedCount = allSteps.filter(s => s.validated).length;
  const progressPercent = (validatedCount / allSteps.length) * 100;

  if (collapsed) {
    return (
      <div className="flex items-center justify-center p-2 border-r bg-background">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with collapse button */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-sm">Navigation</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 md:flex hidden"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      {/* Search and Save */}
      <div className="p-4 space-y-3 border-b">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search nodes..."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveLocally}
          className="w-full"
        >
          <Save className="size-4 mr-2" />
          Save Locally
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{validatedCount}/{allSteps.length} steps</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Step list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {hasSubtasks ? (
          // Grouped view
          Object.entries(groupedSteps).map(([subtask, items]) => (
            <div key={subtask} className="mb-4">
              <div className="text-xs text-muted-foreground mb-2 px-1">
                {subtask}
              </div>
              <div className="space-y-2">
                {items.map(({ step, originalIndex }) => (
                  <StepNode
                    key={step.id}
                    step={step}
                    index={originalIndex}
                    isActive={originalIndex === activeStepIndex}
                    onClick={() => {
                      onStepSelect(originalIndex);
                      // Auto-collapse on mobile after selection
                      if (window.innerWidth < 768) {
                        onToggleCollapse();
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Flat list
          steps.map((step) => {
            const originalIndex = allSteps.findIndex(s => s.id === step.id);
            return (
              <StepNode
                key={step.id}
                step={step}
                index={originalIndex}
                isActive={originalIndex === activeStepIndex}
                onClick={() => {
                  onStepSelect(originalIndex);
                  // Auto-collapse on mobile after selection
                  if (window.innerWidth < 768) {
                    onToggleCollapse();
                  }
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}