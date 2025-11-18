import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, example?: string) => void;
  currentTemplateName: string;
  currentExample?: string;
}

export function SaveTemplateModal({ open, onClose, onSave, currentTemplateName, currentExample }: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const [example, setExample] = useState('');

  useEffect(() => {
    if (open) {
      setName(currentTemplateName || '');
      setExample(currentExample || '');
    }
  }, [open, currentTemplateName, currentExample]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    onSave(name.trim(), example.trim() || undefined);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onKeyDown={handleKeyDown} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-example">Example (Optional)</Label>
            <Textarea
              id="template-example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Enter an example of how to use this template..."
              className="min-h-[150px] resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
