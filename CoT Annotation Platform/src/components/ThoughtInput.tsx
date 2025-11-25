import { useState, useRef, useEffect } from 'react';
import { ThoughtData } from '../App';
import { Textarea } from './ui/textarea';

interface ThoughtInputProps {
  thought: ThoughtData;
  label: string;
  onChange: (thought: ThoughtData) => void;
  onAddAnnotation?: (start: number, end: number, correction: string) => void;
}

export function ThoughtInput({ thought, label, onChange, onAddAnnotation }: ThoughtInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);

  // Track text selection
  const handleSelect = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        setSelectionRange({ start, end });
      } else {
        setSelectionRange(null);
      }
    }
  };

  // Handle keyboard shortcut for adding annotation (Ctrl/Cmd + M)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'm' && selectionRange) {
      e.preventDefault();
      const selectedText = thought.content.substring(selectionRange.start, selectionRange.end);
      const correction = prompt(`Add correction for: "${selectedText}"`);
      if (correction && onAddAnnotation) {
        onAddAnnotation(selectionRange.start, selectionRange.end, correction);
      }
    }
  };

  // Render text with annotations highlighted
  const renderWithAnnotations = () => {
    if (thought.annotations.length === 0) {
      return null;
    }

    const parts: Array<{ text: string; isAnnotated: boolean; correction?: string }> = [];
    let lastIndex = 0;

    // Sort annotations by start position
    const sortedAnnotations = [...thought.annotations].sort((a, b) => a.start - b.start);

    sortedAnnotations.forEach((annotation) => {
      // Add text before annotation
      if (annotation.start > lastIndex) {
        parts.push({
          text: thought.content.substring(lastIndex, annotation.start),
          isAnnotated: false,
        });
      }
      // Add annotated text
      parts.push({
        text: thought.content.substring(annotation.start, annotation.end),
        isAnnotated: true,
        correction: annotation.correction,
      });
      lastIndex = annotation.end;
    });

    // Add remaining text
    if (lastIndex < thought.content.length) {
      parts.push({
        text: thought.content.substring(lastIndex),
        isAnnotated: false,
      });
    }

    return (
      <div className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words p-3 text-transparent">
        {parts.map((part, idx) => (
          <span
            key={idx}
            className={part.isAnnotated ? 'bg-yellow-200 dark:bg-yellow-900' : ''}
            title={part.correction}
          >
            {part.text}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm">{label}</label>
        {thought.annotations.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {thought.annotations.length} annotation{thought.annotations.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="relative">
        {renderWithAnnotations()}
        <Textarea
          ref={textareaRef}
          value={thought.content}
          onChange={(e) => onChange({ ...thought, content: e.target.value })}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          className="min-h-[120px] resize-y relative z-10 bg-transparent"
          placeholder="Enter thought content..."
        />
      </div>
      {thought.annotations.length > 0 && (
        <div className="space-y-1">
          {thought.annotations.map((annotation, idx) => (
            <div
              key={idx}
              className="text-xs p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded"
            >
              <div className="text-muted-foreground">
                "{thought.content.substring(annotation.start, annotation.end)}"
              </div>
              <div className="mt-1">→ {annotation.correction}</div>
            </div>
          ))}
        </div>
      )}
      {selectionRange && (
        <div className="text-xs text-muted-foreground">
          Tip: Press Ctrl+M (or Cmd+M) to add annotation for selected text
        </div>
      )}
    </div>
  );
}
