import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Save, Plus, Edit2, Trash2, Download, Upload, RotateCcw } from 'lucide-react';
import type { Template } from '../App';

interface TemplateToolbarProps {
  templates: Template[];
  currentTemplateName: string;
  onLoadTemplate: (name: string) => void;
  onNewTemplate: () => void;
  onSaveTemplate: () => void;
  onRenameTemplate: (oldName: string, newName: string) => void;
  onRemoveTemplate: (name: string) => void;
  onImportTemplate: (file: File) => void;
  onExportTemplate: () => void;
  onRestore: () => void;
  onImportCollection: () => void;
  onExportCollection: () => void;
}

export function TemplateToolbar({
  templates,
  currentTemplateName,
  onLoadTemplate,
  onNewTemplate,
  onSaveTemplate,
  onRenameTemplate,
  onRemoveTemplate,
  onImportTemplate,
  onExportTemplate,
  onRestore,
  onImportCollection,
  onExportCollection
}: TemplateToolbarProps) {
  const handleRename = () => {
    if (!currentTemplateName) {
      alert('Please select a template first');
      return;
    }
    const newName = prompt('Enter new template name:', currentTemplateName);
    if (newName && newName.trim() && newName !== currentTemplateName) {
      onRenameTemplate(currentTemplateName, newName.trim());
    }
  };

  const handleRemove = () => {
    if (!currentTemplateName) {
      alert('Please select a template first');
      return;
    }
    onRemoveTemplate(currentTemplateName);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onImportTemplate(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
      <div className="flex-1">
        <Select value={currentTemplateName} onValueChange={onLoadTemplate}>
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder="Select a template..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map(template => (
              <SelectItem key={template.name} value={template.name}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button onClick={onNewTemplate} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
        <Button onClick={onSaveTemplate} variant="default" size="sm">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button onClick={handleRename} variant="outline" size="sm">
          <Edit2 className="w-4 h-4 mr-1" />
          Rename
        </Button>
        <Button onClick={handleRemove} variant="outline" size="sm">
          <Trash2 className="w-4 h-4 mr-1" />
          Remove
        </Button>
        <Button onClick={handleImport} variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-1" />
          Import
        </Button>
        <Button onClick={onExportTemplate} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
        <Button onClick={onRestore} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-1" />
          Restore
        </Button>
        <div className="border-l" />
        <Button onClick={onImportCollection} variant="outline" size="sm" title="Import template collection">
          <Upload className="w-4 h-4 mr-1" />
          Import Collection
        </Button>
        <Button onClick={onExportCollection} variant="outline" size="sm" title="Export template collection">
          <Download className="w-4 h-4 mr-1" />
          Export Collection
        </Button>
      </div>
    </div>
  );
}
