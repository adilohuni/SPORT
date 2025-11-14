import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
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
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Support both single template and collection format
        if (parsed.name && parsed.data && !Array.isArray(parsed.templates)) {
          // Single template format
          setParsedData({ templates: [parsed] });
          setError('');
        } else if (Array.isArray(parsed.templates)) {
          // Collection format
          setParsedData({
            mainFileName: parsed.mainFileName,
            templates: parsed.templates
          });
          setError('');
        } else if (Array.isArray(parsed)) {
          // Array of templates
          setParsedData({ templates: parsed });
          setError('');
        } else {
          setError('Invalid file format. Expected a template collection.');
          setParsedData(null);
        }
      } catch (err) {
        setError('Failed to parse file. Please ensure it is valid JSON.');
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

        <div className="space-y-4 py-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="collection-file">Select JSON File</Label>
            <div className="flex items-center gap-3">
              <input
                id="collection-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              {fileName && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {fileName}
                </div>
              )}
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
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
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
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <Label className="text-sm font-medium">Templates to Import:</Label>
              <div className="space-y-1">
                {parsedData.templates.map((template, idx) => (
                  <div key={idx} className="text-sm px-3 py-2 bg-blue-50 rounded text-gray-700">
                    • {template.name}
                  </div>
                ))}
              </div>
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
