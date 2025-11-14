import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Template } from '../App';

interface ExportTemplatesCollectionModalProps {
  open: boolean;
  onClose: () => void;
  templates: Template[];
  mainFileName: string;
}

export function ExportTemplatesCollectionModal({
  open,
  onClose,
  templates,
  mainFileName
}: ExportTemplatesCollectionModalProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(
    new Set(templates.map(t => t.name))
  );
  const [fileName, setFileName] = useState(`${mainFileName.replace(/\s+/g, '_')}_templates`);

  const selectedCount = useMemo(() => selectedTemplates.size, [selectedTemplates]);

  const handleToggleTemplate = (name: string) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedTemplates(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedCount === templates.length) {
      setSelectedTemplates(new Set());
    } else {
      setSelectedTemplates(new Set(templates.map(t => t.name)));
    }
  };

  const handleExport = () => {
    const templatesToExport = templates.filter(t => selectedTemplates.has(t.name));

    const collection = {
      mainFileName,
      templates: templatesToExport,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.json`;
    a.click();
    URL.revokeObjectURL(url);

    onClose();
  };

  const handleClose = () => {
    setSelectedTemplates(new Set(templates.map(t => t.name)));
    setFileName(`${mainFileName.replace(/\s+/g, '_')}_templates`);
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
          <DialogTitle>Export Templates Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="export-file-name">File Name</Label>
            <Input
              id="export-file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name..."
            />
            <p className="text-xs text-gray-500">.json extension will be added automatically</p>
          </div>

          {/* Select Templates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Select Templates to Export</Label>
              <Button
                onClick={handleToggleAll}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                {selectedCount === templates.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {templates.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No templates available to export</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {templates.map((template) => (
                  <div key={template.name} className="flex items-center space-x-3">
                    <Checkbox
                      id={`template-${template.name}`}
                      checked={selectedTemplates.has(template.name)}
                      onCheckedChange={() => handleToggleTemplate(template.name)}
                    />
                    <Label
                      htmlFor={`template-${template.name}`}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {template.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selection Summary */}
          {templates.length > 0 && (
            <Alert>
              <AlertDescription>
                <strong>{selectedCount}</strong> of <strong>{templates.length}</strong> template(s) selected for export
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedCount === 0 || !fileName.trim()}
          >
            Export Templates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
