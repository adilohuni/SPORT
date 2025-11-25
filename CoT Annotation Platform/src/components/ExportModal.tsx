import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { RunData } from '../App';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

interface ExportModalProps {
  run: RunData;
  onClose: () => void;
}

type ExportFormat = 'json' | 'csv';

export function ExportModal({ run, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('json');
  const [includeComments, setIncludeComments] = useState(true);
  const [includeVersionHistory, setIncludeVersionHistory] = useState(false);
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  const [validatedOnly, setValidatedOnly] = useState(false);

  const exportAsJson = () => {
    const filteredSteps = validatedOnly
      ? run.steps.filter((s) => s.validated)
      : run.steps;

    const data = {
      id: run.id,
      title: run.title,
      status: run.status,
      lastModified: run.lastModified,
      steps: filteredSteps.map((step) => ({
        id: step.id,
        nodeId: step.nodeId,
        prompt: step.prompt,
        thoughts: step.thoughts.map((t) => ({
          id: t.id,
          content: t.content,
          ...(includeAnnotations && { annotations: t.annotations }),
        })),
        qualityScore: step.qualityScore,
        subtask: step.subtask,
        validated: step.validated,
        validationIssues: step.validationIssues,
      })),
      ...(includeComments && { comments: run.comments }),
      ...(includeVersionHistory && { versionHistory: run.versionHistory }),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${run.title.replace(/\s+/g, '_')}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsCsv = () => {
    const filteredSteps = validatedOnly
      ? run.steps.filter((s) => s.validated)
      : run.steps;

    const headers = [
      'Step ID',
      'Node ID',
      'Subtask',
      'Prompt',
      'Thought 1',
      'Thought 2',
      'Thought 3',
      'Quality Score',
      'Validated',
      'Validation Issues',
    ];

    if (includeAnnotations) {
      headers.push('Annotations Count');
    }

    const rows = filteredSteps.map((step) => {
      const row = [
        step.id,
        step.nodeId,
        step.subtask || '',
        `"${step.prompt.replace(/"/g, '""')}"`,
        `"${step.thoughts[0].content.replace(/"/g, '""')}"`,
        `"${step.thoughts[1].content.replace(/"/g, '""')}"`,
        `"${step.thoughts[2].content.replace(/"/g, '""')}"`,
        step.qualityScore.toString(),
        step.validated ? 'Yes' : 'No',
        `"${step.validationIssues.join('; ').replace(/"/g, '""')}"`,
      ];

      if (includeAnnotations) {
        const annotationsCount = step.thoughts.reduce(
          (sum, t) => sum + t.annotations.length,
          0
        );
        row.push(annotationsCount.toString());
      }

      return row;
    });

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${run.title.replace(/\s+/g, '_')}_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (format === 'json') {
      exportAsJson();
    } else {
      exportAsCsv();
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Run Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="cursor-pointer">
                  JSON (Full structure)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="cursor-pointer">
                  CSV (Tabular format)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <Label>Include</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="annotations"
                  checked={includeAnnotations}
                  onCheckedChange={(checked) => setIncludeAnnotations(checked as boolean)}
                />
                <Label htmlFor="annotations" className="cursor-pointer">
                  Annotations
                </Label>
              </div>
              {format === 'json' && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="comments"
                      checked={includeComments}
                      onCheckedChange={(checked) => setIncludeComments(checked as boolean)}
                    />
                    <Label htmlFor="comments" className="cursor-pointer">
                      Comments
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="version"
                      checked={includeVersionHistory}
                      onCheckedChange={(checked) =>
                        setIncludeVersionHistory(checked as boolean)
                      }
                    />
                    <Label htmlFor="version" className="cursor-pointer">
                      Version History
                    </Label>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Validated only filter */}
          <div className="space-y-3">
            <Label>Filters</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="validated"
                checked={validatedOnly}
                onCheckedChange={(checked) => setValidatedOnly(checked as boolean)}
              />
              <Label htmlFor="validated" className="cursor-pointer">
                Export only validated steps
              </Label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="size-4 mr-2" />
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
