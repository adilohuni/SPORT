import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Copy, Trash2, FileText } from 'lucide-react';

interface OutputAreaProps {
  output: string;
  onOutputChange: (value: string) => void;
  onClear: () => void;
  onCopy: () => void;
  onShowExample: () => void;
  hasExample: boolean;
}

export function OutputArea({ output, onOutputChange, onClear, onCopy, onShowExample, hasExample }: OutputAreaProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Output</CardTitle>
          <div className="flex gap-2">
            {hasExample && (
              <Button onClick={onShowExample} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-1" />
                Example
              </Button>
            )}
            <Button onClick={onCopy} variant="outline" size="sm" disabled={!output}>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button onClick={onClear} variant="outline" size="sm" disabled={!output}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={output}
          onChange={(e) => onOutputChange(e.target.value)}
          placeholder="Click buttons below to compose your text..."
          className="min-h-[120px] resize-none"
        />
      </CardContent>
    </Card>
  );
}
