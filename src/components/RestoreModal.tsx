import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { RotateCcw } from 'lucide-react';
import type { DeletedTemplate } from '../App';

interface RestoreModalProps {
  open: boolean;
  onClose: () => void;
  deletedTemplates: DeletedTemplate[];
  onRestore: (template: DeletedTemplate) => void;
}

export function RestoreModal({ open, onClose, deletedTemplates, onRestore }: RestoreModalProps) {
  const handleRestore = (template: DeletedTemplate) => {
    onRestore(template);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Restore Deleted Templates</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {deletedTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No deleted templates to restore
            </div>
          ) : (
            <div className="space-y-3">
              {deletedTemplates.map((template, index) => (
                <div
                  key={`${template.name}-${template.deletedDate}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div>{template.name}</div>
                    <div className="text-sm text-gray-500">
                      Deleted: {new Date(template.deletedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Button onClick={() => handleRestore(template)} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
