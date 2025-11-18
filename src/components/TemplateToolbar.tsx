import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Save, Plus, Edit2, Trash2, Download, Upload, RotateCcw } from 'lucide-react';
import { InputDialog } from './InputDialog';
import ThemeToggle from './ThemeToggle';
import { toast } from 'sonner';
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
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  const wheelCooldownRef = useRef<number>(0);
  const selectTriggerRef = useRef<HTMLElement | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    const node = selectTriggerRef.current;
    if (!node) return;

    const nativeWheel = (e: WheelEvent) => {
      // ensure we can prevent default scrolling
      e.preventDefault();
      const now = Date.now();
      const throttleMs = 180;
      if (now - wheelCooldownRef.current < throttleMs) return;
      wheelCooldownRef.current = now;

      if (!templates || templates.length === 0) return;

      const idx = templates.findIndex(t => t.name === currentTemplateName);
      let newIndex = 0;

      if (e.deltaY < 0) {
        newIndex = idx > 0 ? idx - 1 : templates.length - 1;
      } else {
        newIndex = idx >= 0 ? (idx + 1) % templates.length : 0;
      }

      const newName = templates[newIndex]?.name;
      if (newName && newName !== currentTemplateName) {
        // small visual feedback to make switching feel smoother
        setIsSwitching(true);
        window.requestAnimationFrame(() => {
          onLoadTemplate(newName);
        });
        setTimeout(() => setIsSwitching(false), 160);
      }
    };

    node.addEventListener('wheel', nativeWheel as EventListener, { passive: false });
    return () => node.removeEventListener('wheel', nativeWheel as EventListener);
  // Depend on currentTemplateName and templates so handler sees latest
  }, [currentTemplateName, templates, onLoadTemplate]);

  const handleRename = () => {
    if (!currentTemplateName) {
      toast.error('Please select a template first');
      return;
    }
    setShowRenameDialog(true);
  };

  const handleRenameConfirm = (newName: string) => {
    if (newName && newName !== currentTemplateName) {
      onRenameTemplate(currentTemplateName, newName);
      toast.success('Template renamed');
    }
    setShowRenameDialog(false);
  };

  const handleRemove = () => {
    if (!currentTemplateName) {
      toast.error('Please select a template first');
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
    <>
      <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
        <div className="flex-1">
          <Select value={currentTemplateName} onValueChange={onLoadTemplate}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SelectTrigger ref={selectTriggerRef as any} className={`w-full max-w-sm transition-opacity duration-150 ${isSwitching ? 'opacity-80' : ''}`}>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">Scroll to switch templates</TooltipContent>
            </Tooltip>
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
          <Button onClick={onNewTemplate} variant="secondary" size="sm" className="toolbar-btn toolbar-new">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
          <Button onClick={onSaveTemplate} variant="default" size="sm" className="toolbar-btn toolbar-save">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button onClick={handleRename} variant="outline" size="sm" className="toolbar-btn toolbar-outline">
            <Edit2 className="w-4 h-4 mr-1" />
            Rename
          </Button>
          <Button onClick={handleRemove} variant="destructive" size="sm" className="toolbar-btn toolbar-remove">
            <Trash2 className="w-4 h-4 mr-1" />
            Remove
          </Button>
          <Button onClick={handleImport} variant="ghost" size="sm" className="toolbar-btn toolbar-import">
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
          <Button onClick={onExportTemplate} variant="ghost" size="sm" className="toolbar-btn toolbar-export">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button onClick={onRestore} variant="outline" size="sm" className="toolbar-btn toolbar-restore">
            <RotateCcw className="w-4 h-4 mr-1" />
            Restore
          </Button>
          <div className="border-l" />
          <Button onClick={onImportCollection} variant="ghost" size="sm" className="toolbar-btn toolbar-import-collection" title="Import template collection">
            <Upload className="w-4 h-4 mr-1" />
            Import Collection
          </Button>
          <Button onClick={onExportCollection} variant="ghost" size="sm" className="toolbar-btn toolbar-export-collection" title="Export template collection">
            <Download className="w-4 h-4 mr-1" />
            Export Collection
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <InputDialog
        open={showRenameDialog}
        title="Rename Template"
        label="New template name"
        placeholder="Enter new template name..."
        defaultValue={currentTemplateName}
        onConfirm={handleRenameConfirm}
        onCancel={() => setShowRenameDialog(false)}
        confirmText="Rename"
      />
    </>
  );
}
