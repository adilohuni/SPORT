import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StepData, ThoughtData, VersionEntry } from '../App';
import { ThoughtInput } from './ThoughtInput';
import { ValidationPanel } from './ValidationPanel';
import { ToolsPanel } from './ToolsPanel';
import { VersionHistory } from './VersionHistory';
import { QualityScore } from './QualityScore';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface StepEditorProps {
  step: StepData;
  stepIndex: number;
  totalSteps: number;
  onUpdate: (step: StepData) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  versionHistory: VersionEntry[];
}

export function StepEditor({
  step,
  stepIndex,
  totalSteps,
  onUpdate,
  onNavigate,
  versionHistory,
}: StepEditorProps) {
  const [selectedText, setSelectedText] = useState('');
  const [activeThoughtIndex, setActiveThoughtIndex] = useState<number | null>(null);

  // Word jumbler: randomizes simple words
  const jumbleWords = (text: string): string => {
    const simpleWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were'];
    const words = text.split(/\b/);
    return words
      .map((word) => {
        if (simpleWords.includes(word.toLowerCase())) {
          const randomWord = simpleWords[Math.floor(Math.random() * simpleWords.length)];
          return word[0] === word[0].toUpperCase()
            ? randomWord.charAt(0).toUpperCase() + randomWord.slice(1)
            : randomWord;
        }
        return word;
      })
      .join('');
  };

  // JSON formatter: escapes brackets
  const formatJson = (text: string): string => {
    return text.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
  };

  const handleWordJumble = () => {
    if (activeThoughtIndex !== null && selectedText) {
      const thought = step.thoughts[activeThoughtIndex];
      const jumbled = thought.content.replace(selectedText, jumbleWords(selectedText));
      updateThought(activeThoughtIndex, { ...thought, content: jumbled });
    }
  };

  const handleTemplateInsert = (template: string) => {
    if (activeThoughtIndex !== null) {
      const thought = step.thoughts[activeThoughtIndex];
      updateThought(activeThoughtIndex, {
        ...thought,
        content: thought.content + (thought.content ? '\n\n' : '') + template,
      });
    }
  };

  const handleJsonFormat = () => {
    if (activeThoughtIndex !== null && selectedText) {
      const thought = step.thoughts[activeThoughtIndex];
      const formatted = thought.content.replace(selectedText, formatJson(selectedText));
      updateThought(activeThoughtIndex, { ...thought, content: formatted });
    }
  };

  const updateThought = (index: number, updatedThought: ThoughtData) => {
    const newThoughts: [ThoughtData, ThoughtData, ThoughtData] = [...step.thoughts] as [
      ThoughtData,
      ThoughtData,
      ThoughtData
    ];
    newThoughts[index] = updatedThought;
    onUpdate({ ...step, thoughts: newThoughts });
  };

  const addAnnotation = (thoughtIndex: number, start: number, end: number, correction: string) => {
    const thought = step.thoughts[thoughtIndex];
    const newAnnotations = [...thought.annotations, { start, end, correction }];
    updateThought(thoughtIndex, { ...thought, annotations: newAnnotations });
  };

  // Track text selection across thoughts
  const handleTextSelect = (thoughtIndex: number, event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      setSelectedText(textarea.value.substring(start, end));
      setActiveThoughtIndex(thoughtIndex);
    } else {
      setSelectedText('');
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header with navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg">{step.nodeId}</h2>
            <QualityScore score={step.qualityScore} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Step {stepIndex + 1} of {totalSteps}
            </span>
            <VersionHistory history={versionHistory} />
          </div>
        </div>

        {/* Prompt display (read-only) */}
        <div className="space-y-2">
          <label className="text-sm">Prompt (Read-only)</label>
          <div className="p-4 bg-muted rounded-lg border">
            <pre className="whitespace-pre-wrap break-words text-sm">{step.prompt}</pre>
          </div>
        </div>

        <Separator />

        {/* Three thought inputs */}
        <div className="space-y-6">
          {step.thoughts.map((thought, index) => (
            <div
              key={thought.id}
              onFocus={() => setActiveThoughtIndex(index)}
            >
              <ThoughtInput
                thought={thought}
                label={`Thought ${index + 1}`}
                onChange={(updated) => updateThought(index, updated)}
                onAddAnnotation={(start, end, correction) =>
                  addAnnotation(index, start, end, correction)
                }
              />
            </div>
          ))}
        </div>

        <Separator />

        {/* Tools panel */}
        <ToolsPanel
          selectedText={selectedText}
          onWordJumble={handleWordJumble}
          onTemplateInsert={handleTemplateInsert}
          onJsonFormat={handleJsonFormat}
        />

        <Separator />

        {/* Validation panel */}
        <ValidationPanel step={step} />

        <Separator />

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => onNavigate('prev')}
            disabled={stepIndex === 0}
          >
            <ChevronLeft className="size-4 mr-2" />
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={() => onNavigate('next')}
            disabled={stepIndex === totalSteps - 1}
          >
            Next
            <ChevronRight className="size-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
