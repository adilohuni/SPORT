import { Shuffle, FileJson, Plus } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ToolsPanelProps {
  selectedText: string;
  onWordJumble: () => void;
  onTemplateInsert: (template: string) => void;
  onJsonFormat: () => void;
}

const cotTemplates = [
  {
    name: 'Basic Reasoning',
    content: 'First, I need to understand the problem: [problem statement]\n\nSecond, I will analyze the key components: [analysis]\n\nFinally, I can conclude that: [conclusion]',
  },
  {
    name: 'Step-by-Step Analysis',
    content: 'Step 1: Identify the given information\nStep 2: Determine what is being asked\nStep 3: Apply relevant principles or methods\nStep 4: Verify the solution makes sense',
  },
  {
    name: 'Comparative Reasoning',
    content: 'When comparing [option A] and [option B]:\n\nOption A has the advantage of: [advantages]\nHowever, it has these drawbacks: [drawbacks]\n\nOption B offers: [benefits]\nBut it may suffer from: [limitations]\n\nTherefore, the better choice is: [conclusion]',
  },
  {
    name: 'Problem Decomposition',
    content: 'This complex problem can be broken down into:\n1. [Sub-problem 1]\n2. [Sub-problem 2]\n3. [Sub-problem 3]\n\nBy solving each component, we can synthesize: [final solution]',
  },
  {
    name: 'Hypothesis Testing',
    content: 'Hypothesis: [statement]\n\nEvidence supporting this: [supporting evidence]\nEvidence against this: [contradicting evidence]\n\nConclusion: The hypothesis is [supported/rejected] because [reasoning]',
  },
];

export function ToolsPanel({
  selectedText,
  onWordJumble,
  onTemplateInsert,
  onJsonFormat,
}: ToolsPanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm">Tools</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Word Jumbler */}
        <Button
          variant="outline"
          size="sm"
          onClick={onWordJumble}
          disabled={!selectedText}
          title={selectedText ? 'Jumble selected words' : 'Select text first'}
        >
          <Shuffle className="size-4 mr-2" />
          Word Jumbler
        </Button>

        {/* Template Insert */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="size-4 mr-2" />
              Insert Template
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {cotTemplates.map((template) => (
              <DropdownMenuItem
                key={template.name}
                onClick={() => onTemplateInsert(template.content)}
              >
                {template.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* JSON Formatter */}
        <Button
          variant="outline"
          size="sm"
          onClick={onJsonFormat}
          disabled={!selectedText}
          title={selectedText ? 'Escape JSON brackets' : 'Select text first'}
        >
          <FileJson className="size-4 mr-2" />
          JSON Formatter
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Word Jumbler: Randomizes simple words in selected text</p>
        <p>• Templates: Insert pre-built CoT reasoning patterns</p>
        <p>• JSON Formatter: Escapes brackets in selected text</p>
      </div>
    </div>
  );
}
