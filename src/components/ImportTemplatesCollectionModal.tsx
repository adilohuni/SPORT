import { useState } from 'react';
import validateJsonFromText from '../utils/jsonValidator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import type { Template } from '../App';

interface ImportTemplatesCollectionModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (templates: Template[], mode: 'replace' | 'merge') => void;
}

interface ParsedCollection {
  mainFileName?: string;
  templates: Template[];
}

export function ImportTemplatesCollectionModal({ open, onClose, onImport }: ImportTemplatesCollectionModalProps) {
  const [mode, setMode] = useState<'replace' | 'merge'>('merge');
  const [parsedData, setParsedData] = useState<ParsedCollection | null>(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = validateJsonFromText(content || '');
      if (!res.ok) {
        setError(res.error || 'Failed to parse file. Please ensure it contains valid JSON.');
        setParsedData(null);
        return;
      }

      const parsed = res.parsed;
      // Helper to coerce/clean a potential template object into our Template shape
      const sanitizeTemplate = (t: any): Template | null => {
        if (!t || typeof t !== 'object') return null;
        const name = t.name != null ? String(t.name) : '';
        if (!name.trim()) return null;
        let data: string;
        if (typeof t.data === 'string') data = t.data;
        else data = JSON.stringify(t.data ?? '');
        const example = t.example != null ? String(t.example) : undefined;
        return { name: name.trim(), data, example };
      };

      // Support both single template and collection format, but always sanitize
      if (parsed && parsed.name && parsed.data && !Array.isArray(parsed.templates)) {
        // Single template format
        const s = sanitizeTemplate(parsed);
        if (s) {
          setParsedData({ templates: [s] });
          setError('');
        } else {
          setError('Invalid template in file');
          setParsedData(null);
        }
      } else if (parsed && Array.isArray(parsed.templates)) {
        // Collection format
        const sanitized = parsed.templates.map(sanitizeTemplate).filter(Boolean) as Template[];
        if (sanitized.length > 0) {
          setParsedData({
            mainFileName: parsed.mainFileName,
            templates: sanitized
          });
          setError('');
        } else {
          setError('No valid templates found in collection');
          setParsedData(null);
        }
      } else if (Array.isArray(parsed)) {
        // Array of templates
        const sanitized = parsed.map(sanitizeTemplate).filter(Boolean) as Template[];
        if (sanitized.length > 0) {
          setParsedData({ templates: sanitized });
          setError('');
        } else {
          setError('No valid templates found in file');
          setParsedData(null);
        }
      } else {
        setError('Invalid file format. Expected a template collection.');
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!parsedData || parsedData.templates.length === 0) {
      setError('No templates to import');
      return;
    }

    onImport(parsedData.templates, mode);
    setParsedData(null);
    setError('');
    setFileName('');
    onClose();
  };

  const handleClose = () => {
    setParsedData(null);
    setError('');
    setFileName('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onKeyDown={handleKeyDown} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Templates Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 min-w-0 w-full">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="collection-file">Select JSON File</Label>
            <div className="flex items-center gap-3">
              <input
                id="collection-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button asChild variant="outline" size="sm">
                <label htmlFor="collection-file" className="m-0 cursor-pointer">Choose File</label>
              </Button>

              <div className="flex-1 min-w-0">
                {fileName ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 truncate">
                    <CheckCircle className="w-4 h-4" />
                    <span className="truncate">{fileName}</span>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No file selected</div>
                )}
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {parsedData && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Ready to import <strong>{parsedData.templates.length}</strong> template(s)
                {parsedData.mainFileName && ` from project "${parsedData.mainFileName}"`}
              </AlertDescription>
            </Alert>
          )}

          {/* Import Mode Selection */}
          {parsedData && (
            <div className="space-y-3 p-4 bg-background rounded-md border w-full box-border min-w-0">
              <Label className="text-base font-medium">Import Mode</Label>
              <RadioGroup value={mode} onValueChange={(value: any) => setMode(value as 'replace' | 'merge')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="merge" id="mode-merge" />
                  <Label htmlFor="mode-merge" className="font-normal cursor-pointer">
                    <strong>Merge</strong> - Add templates to existing collection
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="mode-replace" />
                  <Label htmlFor="mode-replace" className="font-normal cursor-pointer">
                    <strong>Replace</strong> - Replace all existing templates with imported ones
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Template List Preview */}
          {parsedData && parsedData.templates.length > 0 && (
            <div className="space-y-2 min-w-0">
              <Label className="text-sm font-medium">Templates to Import:</Label>
              <ScrollArea className="w-full max-h-48 rounded-md border min-w-0">
                <div className="p-2 space-y-1 min-w-0">
                  {parsedData.templates.map((template, idx) => (
                    <div key={idx} className="text-sm px-3 py-2 bg-muted rounded text-muted-foreground w-full box-border truncate">
                      • {template.name}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!parsedData || parsedData.templates.length === 0}>
            Import Templates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
