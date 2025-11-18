import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MainFileCard } from './components/MainFileCard';
import { TemplateToolbar } from './components/TemplateToolbar';
import { OutputArea } from './components/OutputArea';
import { GridWorkspace } from './components/GridWorkspace';
import { GridControls } from './components/GridControls';
import { SaveTemplateModal } from './components/SaveTemplateModal';
import { ImportModal } from './components/ImportModal';
import { ExampleModal } from './components/ExampleModal';
import { RestoreModal } from './components/RestoreModal';
import { ImportTemplatesCollectionModal } from './components/ImportTemplatesCollectionModal';
import { ExportTemplatesCollectionModal } from './components/ExportTemplatesCollectionModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { InputDialog } from './components/InputDialog';
import { Toaster, toast } from 'sonner';
import validateJsonFromText from './utils/jsonValidator';
import BUILTIN_MAIN_FILE from './generated/builtinTemplates';

export interface Cell {
  title: string;
  buttons: string[];
}

export interface Template {
  name: string;
  data: string;
  example?: string;
}

export interface MainFile {
  mainFileName: string;
  templates: Template[];
  exportDate: string;
}

export interface DeletedTemplate extends Template {
  deletedDate: string;
}

export default function App() {
  // Coerce any incoming template-like object to our `Template` shape and
  // ensure `data` and `name` are primitive strings. Returns `null` for
  // invalid entries.
  const sanitizeTemplate = (t: any): Template | null => {
    if (!t || typeof t !== 'object') return null;
    const name = t.name != null ? String(t.name) : '';
    if (!name.trim()) return null;
    let data: string;
    if (typeof t.data === 'string') data = t.data;
    else {
      try {
        data = JSON.stringify(t.data ?? '');
      } catch (err) {
        // fallback to empty string if data can't be stringified
        data = '';
      }
    }
    const example = t.example != null ? String(t.example) : undefined;
    return { name: name.trim(), data, example };
  };

  // Ensure template names are unique within a collection. If duplicates
  // exist, append " (2)", " (3)", ... to make them distinct.
  const ensureUniqueTemplateNames = (tpls: Template[]): Template[] => {
    const result: Template[] = [];
    const exists = (name: string) => result.some(r => r.name === name);

    for (const t of tpls) {
      const original = t.name;
      // Try original name first
      if (!exists(original)) {
        result.push(t);
        continue;
      }

      // If original exists, find next available suffix
      let i = 2;
      let candidate = `${original} (${i})`;
      while (exists(candidate)) {
        i += 1;
        candidate = `${original} (${i})`;
      }
      result.push({ ...t, name: candidate });
    }

    return result;
  };

  const [mainFileName, setMainFileName] = useState('PromptGrid Studio');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [deletedTemplates, setDeletedTemplates] = useState<DeletedTemplate[]>([]);
  const [currentTemplateName, setCurrentTemplateName] = useState<string>('');
  const [grid, setGrid] = useState<(Cell | null)[][]>([[{ title: 'Start', buttons: [] }, null, null]]);
  const [output, setOutput] = useState('');
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showImportCollectionModal, setShowImportCollectionModal] = useState(false);
  const [showExportCollectionModal, setShowExportCollectionModal] = useState(false);
  const [newProjectConfirmOpen, setNewProjectConfirmOpen] = useState(false);
  const [renameProjectDialogOpen, setRenameProjectDialogOpen] = useState(false);
  const [removeTemplateConfirmOpen, setRemoveTemplateConfirmOpen] = useState(false);
  const [templateToRemove, setTemplateToRemove] = useState<string>('');
  const [clearOutputConfirmOpen, setClearOutputConfirmOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMainFile = localStorage.getItem('sports-main-file');
    const savedGrid = localStorage.getItem('sports-current-grid');
    const savedTemplateName = localStorage.getItem('sports-current-template-name');
    const savedDeleted = localStorage.getItem('sports-deleted-templates');
    const savedOutput = localStorage.getItem('sports-current-output');

    if (savedMainFile) {
      const mainFile: MainFile = JSON.parse(savedMainFile);
      setMainFileName(mainFile.mainFileName);
      setTemplates(mainFile.templates);
    } else {
      // No saved project — preload built-in templates generated at build time
      try {
        const built = BUILTIN_MAIN_FILE as unknown as MainFile;
        if (built && Array.isArray(built.templates)) {
          const sanitized = built.templates.map(sanitizeTemplate).filter(Boolean) as Template[];
          const unique = ensureUniqueTemplateNames(sanitized);
          setMainFileName(built.mainFileName || mainFileName);
          setTemplates(unique);
        }
      } catch (err) {
        // if something goes wrong, fall back to an empty collection
        console.error('Failed to load built-in templates', err);
      }
    }

    if (savedGrid) {
      setGrid(JSON.parse(savedGrid));
    }

    if (savedTemplateName) {
      setCurrentTemplateName(savedTemplateName);
    }

    if (savedDeleted) {
      setDeletedTemplates(JSON.parse(savedDeleted));
    }

    if (savedOutput) {
      setOutput(savedOutput);
    }
  }, []);

  // Auto-save grid to localStorage
  useEffect(() => {
    localStorage.setItem('sports-current-grid', JSON.stringify(grid));
  }, [grid]);

  // Auto-save output
  useEffect(() => {
    localStorage.setItem('sports-current-output', output);
  }, [output]);

  // Auto-save templates
  useEffect(() => {
    const mainFile: MainFile = {
      mainFileName,
      templates,
      exportDate: new Date().toISOString()
    };
    localStorage.setItem('sports-main-file', JSON.stringify(mainFile));
  }, [mainFileName, templates]);

  // Auto-save deleted templates
  useEffect(() => {
    localStorage.setItem('sports-deleted-templates', JSON.stringify(deletedTemplates));
  }, [deletedTemplates]);

  // Auto-save current template name
  useEffect(() => {
    localStorage.setItem('sports-current-template-name', currentTemplateName);
  }, [currentTemplateName]);

  const handleNewMainFile = () => {
    setNewProjectConfirmOpen(true);
  };

  const handleNewMainFileConfirm = () => {
    setMainFileName('New Project');
    setTemplates([]);
    setGrid([[{ title: 'Start', buttons: [] }, null, null]]);
    setCurrentTemplateName('');
    setOutput('');
    toast.success('New project created');
    setNewProjectConfirmOpen(false);
  };

  const handleRenameMainFile = () => {
    setRenameProjectDialogOpen(true);
  };

  const handleRenameMainFileConfirm = (newName: string) => {
    if (newName && newName.trim() && newName !== mainFileName) {
      setMainFileName(newName.trim());
      toast.success('Project renamed');
    }
    setRenameProjectDialogOpen(false);
  };

  const handleExportAll = () => {
    const mainFile: MainFile = {
      mainFileName,
      templates,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(mainFile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mainFileName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project exported');
  };

  const handleImportAll = (file: File, mode: 'replace' | 'merge') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = validateJsonFromText(content || '');
      if (!res.ok) {
        toast.error(res.error || 'Failed to parse import file');
        return;
      }

      const imported = res.parsed as MainFile;
      if (!imported || !Array.isArray(imported.templates)) {
        toast.error('Invalid project file format');
        return;
      }

      const sanitized = imported.templates.map(sanitizeTemplate).filter(Boolean) as Template[];
      if (sanitized.length === 0) {
        toast.error('No valid templates found in import');
        return;
      }

      if (mode === 'replace') {
        setMainFileName(imported.mainFileName || mainFileName);
        setTemplates(ensureUniqueTemplateNames(sanitized));
        toast.success('Project replaced');
      } else {
        setTemplates(ensureUniqueTemplateNames([...templates, ...sanitized]));
        toast.success('Templates merged');
      }
    };
    reader.readAsText(file);
  };

  const handleNewTemplate = () => {
    setGrid([[{ title: 'Start', buttons: [] }, null, null]]);
    setCurrentTemplateName('');
    setOutput('');
    toast.success('New template created');
  };

  const handleSaveTemplate = (name: string, example?: string) => {
    const gridData = JSON.stringify({ grid });
    const newTemplate: Template = {
      name,
      data: gridData,
      example
    };

    const existingIndex = templates.findIndex(t => t.name === name);
    if (existingIndex >= 0) {
      const updated = [...templates];
      updated[existingIndex] = newTemplate;
      setTemplates(updated);
      toast.success('Template updated');
    } else {
      setTemplates([...templates, newTemplate]);
      toast.success('Template saved');
    }
    setCurrentTemplateName(name);
  };

  const handleLoadTemplate = (name: string) => {
    const template = templates.find(t => t.name === name);
    if (template) {
      try {
        const parsed = JSON.parse(template.data);
        setGrid(parsed.grid);
        setCurrentTemplateName(name);
        setOutput('');
        toast.success('Template loaded');
      } catch (error) {
        toast.error('Failed to load template');
      }
    }
  };

  const handleRenameTemplate = (oldName: string, newName: string) => {
    const updated = templates.map(t => 
      t.name === oldName ? { ...t, name: newName } : t
    );
    setTemplates(updated);
    if (currentTemplateName === oldName) {
      setCurrentTemplateName(newName);
    }
    toast.success('Template renamed');
  };

  const handleRemoveTemplate = (name: string) => {
    setTemplateToRemove(name);
    setRemoveTemplateConfirmOpen(true);
  };

  const handleRemoveTemplateConfirm = () => {
    const template = templates.find(t => t.name === templateToRemove);
    if (template) {
      setDeletedTemplates([...deletedTemplates, { ...template, deletedDate: new Date().toISOString() }]);
      setTemplates(templates.filter(t => t.name !== templateToRemove));
      if (currentTemplateName === templateToRemove) {
        setCurrentTemplateName('');
      }
      toast.success('Template removed');
    }
    setRemoveTemplateConfirmOpen(false);
    setTemplateToRemove('');
  };

  const handleRestoreTemplate = (template: DeletedTemplate) => {
    setTemplates(ensureUniqueTemplateNames([...templates, { name: template.name, data: template.data, example: template.example }]));
    setDeletedTemplates(deletedTemplates.filter(t => t.name !== template.name || t.deletedDate !== template.deletedDate));
    toast.success('Template restored');
  };

  const handleImportTemplate = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = validateJsonFromText(content || '');
      if (!res.ok) {
        toast.error(res.error || 'Failed to parse template file');
        return;
      }

      const imported = res.parsed;
      const s = sanitizeTemplate(imported);
      if (s) {
        setTemplates(ensureUniqueTemplateNames([...templates, s]));
        toast.success('Template imported');
      } else {
        toast.error('Invalid template file');
      }
    };
    reader.readAsText(file);
  };

  const handleValidateOutputJson = () => {
    const res = validateJsonFromText(output || '');
    if (!res.ok) {
      toast.error(res.error || 'No valid JSON found in output');
      return;
    }

    // Pretty-print the extracted JSON back to the output area
    try {
      const pretty = JSON.stringify(res.parsed, null, 2);
      setOutput(pretty);
      toast.success('Valid JSON extracted and formatted');
    } catch (err) {
      toast.success('JSON validated');
    }
  };

  const handleExportTemplate = () => {
    if (!currentTemplateName) {
      toast.error('Please save the template first');
      return;
    }
    const template = templates.find(t => t.name === currentTemplateName);
    if (template) {
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Template exported');
    }
  };

  const handleImportTemplatesCollection = (templatesToImport: Template[], mode: 'replace' | 'merge') => {
    const sanitized = templatesToImport.map(sanitizeTemplate).filter(Boolean) as Template[];
    if (sanitized.length === 0) {
      toast.error('No valid templates to import');
      return;
    }

    if (mode === 'replace') {
      setTemplates(ensureUniqueTemplateNames(sanitized));
      toast.success(`Replaced all templates with ${sanitized.length} imported template(s)`);
    } else {
      setTemplates(ensureUniqueTemplateNames([...templates, ...sanitized]));
      toast.success(`Merged ${sanitized.length} template(s) into collection`);
    }
  };

  const handleExportTemplatesCollection = (selectedTemplates: Template[], fileName: string) => {
    const collection = {
      mainFileName,
      templates: selectedTemplates,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Templates collection exported');
  };

  const handleAddButtonText = (text: string) => {
    setOutput(prev => prev ? `${prev} ${text}` : text);
  };

  const handleClearOutput = () => {
    setClearOutputConfirmOpen(true);
  };

  const handleClearOutputConfirm = () => {
    setOutput('');
    toast.success('Output cleared');
    setClearOutputConfirmOpen(false);
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  };

  const handleShowExample = () => {
    const template = templates.find(t => t.name === currentTemplateName);
    if (template?.example) {
      setShowExampleModal(true);
    } else {
      toast.error('No example available for this template');
    }
  };

  const currentTemplate = templates.find(t => t.name === currentTemplateName);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <MainFileCard
            fileName={mainFileName}
            templateCount={templates.length}
            onNew={handleNewMainFile}
            onRename={handleRenameMainFile}
            onExport={handleExportAll}
            onImport={() => setShowImportModal(true)}
          />

          <TemplateToolbar
            templates={templates}
            currentTemplateName={currentTemplateName}
            onLoadTemplate={handleLoadTemplate}
            onNewTemplate={handleNewTemplate}
            onSaveTemplate={() => setShowSaveModal(true)}
            onRenameTemplate={handleRenameTemplate}
            onRemoveTemplate={handleRemoveTemplate}
            onImportTemplate={handleImportTemplate}
            onExportTemplate={handleExportTemplate}
            onRestore={() => setShowRestoreModal(true)}
            onImportCollection={() => setShowImportCollectionModal(true)}
            onExportCollection={() => setShowExportCollectionModal(true)}
          />

          <OutputArea
            output={output}
            onOutputChange={setOutput}
            onClear={handleClearOutput}
            onCopy={handleCopyOutput}
            onShowExample={handleShowExample}
            onValidateJson={handleValidateOutputJson}
            hasExample={!!currentTemplate?.example}
          />

          <div className="space-y-4">
            <GridWorkspace
              grid={grid}
              onGridChange={setGrid}
              onAddButtonText={handleAddButtonText}
            />
            <GridControls
              grid={grid}
              onGridChange={setGrid}
            />
          </div>
        </div>

        <SaveTemplateModal
          open={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveTemplate}
          currentTemplateName={currentTemplateName}
          currentExample={currentTemplate?.example}
        />

        <ImportModal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportAll}
        />

        <ExampleModal
          open={showExampleModal}
          onClose={() => setShowExampleModal(false)}
          example={currentTemplate?.example || ''}
          templateName={currentTemplateName}
        />

        <RestoreModal
          open={showRestoreModal}
          onClose={() => setShowRestoreModal(false)}
          deletedTemplates={deletedTemplates}
          onRestore={handleRestoreTemplate}
        />

        <ImportTemplatesCollectionModal
          open={showImportCollectionModal}
          onClose={() => setShowImportCollectionModal(false)}
          onImport={handleImportTemplatesCollection}
        />

        <ExportTemplatesCollectionModal
          open={showExportCollectionModal}
          onClose={() => setShowExportCollectionModal(false)}
          templates={templates}
          mainFileName={mainFileName}
        />

        <ConfirmDialog
          open={newProjectConfirmOpen}
          title="Create New Project"
          description="Create a new project? This will clear all templates and current work."
          onConfirm={handleNewMainFileConfirm}
          onCancel={() => setNewProjectConfirmOpen(false)}
          confirmText="Create"
          isDangerous
        />

        <InputDialog
          open={renameProjectDialogOpen}
          title="Rename Project"
          label="New project name"
          placeholder="Enter new project name..."
          defaultValue={mainFileName}
          onConfirm={handleRenameMainFileConfirm}
          onCancel={() => setRenameProjectDialogOpen(false)}
          confirmText="Rename"
        />

        <ConfirmDialog
          open={removeTemplateConfirmOpen}
          title="Remove Template"
          description={`Remove template "${templateToRemove}"? You can restore it later.`}
          onConfirm={handleRemoveTemplateConfirm}
          onCancel={() => {
            setRemoveTemplateConfirmOpen(false);
            setTemplateToRemove('');
          }}
          confirmText="Remove"
          isDangerous
        />

        <ConfirmDialog
          open={clearOutputConfirmOpen}
          title="Clear Output"
          description="Clear all output text?"
          onConfirm={handleClearOutputConfirm}
          onCancel={() => setClearOutputConfirmOpen(false)}
          confirmText="Clear"
          isDangerous
        />

        <Toaster position="bottom-right" />
      </div>
    </DndProvider>
  );
}
