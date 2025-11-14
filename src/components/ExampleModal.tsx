import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface ExampleModalProps {
  open: boolean;
  onClose: () => void;
  example: string;
  templateName: string;
}

export function ExampleModal({ open, onClose, example, templateName }: ExampleModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Example: {templateName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: example }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
