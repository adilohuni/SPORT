import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File, mode: 'replace' | 'merge') => void;
}

export function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const [mode, setMode] = useState<'replace' | 'merge'>('merge');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    onImport(selectedFile, mode);
    setSelectedFile(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file-input">Select File</Label>
            <input
              id="file-input"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:bg-gray-100 file:text-gray-700
                hover:file:bg-gray-200 cursor-pointer"
            />
            {selectedFile && (
              <div className="text-sm text-gray-600">
                Selected: {selectedFile.name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Import Mode</Label>
            <RadioGroup value={mode} onValueChange={(value: any) => setMode(value as 'replace' | 'merge')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="merge" id="merge" />
                <Label htmlFor="merge" className="cursor-pointer">
                  Merge with existing templates
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace" className="cursor-pointer">
                  Replace all templates
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
