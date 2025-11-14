import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileText, Edit2, Download, Upload } from 'lucide-react';

interface MainFileCardProps {
  fileName: string;
  templateCount: number;
  onNew: () => void;
  onRename: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function MainFileCard({ fileName, templateCount, onNew, onRename, onExport, onImport }: MainFileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {fileName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-gray-600">
            {templateCount} {templateCount === 1 ? 'template' : 'templates'}
          </div>
          <div className="flex gap-2">
            <Button onClick={onNew} variant="outline" size="sm">
              New
            </Button>
            <Button onClick={onRename} variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-1" />
              Rename
            </Button>
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export All
            </Button>
            <Button onClick={onImport} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Import All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
