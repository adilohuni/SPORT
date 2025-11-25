import { History, RotateCcw } from 'lucide-react';
import { VersionEntry } from '../App';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface VersionHistoryProps {
  history: VersionEntry[];
  onRestore?: (entry: VersionEntry) => void;
}

export function VersionHistory({ history, onRestore }: VersionHistoryProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="size-4 mr-2" />
          Version History ({history.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <h4 className="text-sm mb-2 px-2">Edit Timeline</h4>
          <ScrollArea className="max-h-80">
            <div className="space-y-1">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-accent rounded-md text-sm space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </span>
                    {onRestore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRestore(entry)}
                        className="h-6 text-xs"
                      >
                        <RotateCcw className="size-3 mr-1" />
                        Restore
                      </Button>
                    )}
                  </div>
                  <div className="text-sm">{entry.author}</div>
                  <div className="text-xs text-muted-foreground">{entry.changes}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
