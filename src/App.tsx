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
import { Toaster, toast } from 'sonner';

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
  const [mainFileName, setMainFileName] = useState('S.P.O.R.T.S.');
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
    if (confirm('Create a new project? This will clear all templates and current work.')) {
      setMainFileName('New Project');
      setTemplates([]);
      setGrid([[{ title: 'Start', buttons: [] }, null, null]]);
      setCurrentTemplateName('');
      setOutput('');
      toast.success('New project created');
    }
  };

  const handleRenameMainFile = () => {
    const newName = prompt('Enter new project name:', mainFileName);
    if (newName && newName.trim()) {
      setMainFileName(newName.trim());
      toast.success('Project renamed');
    }
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
      try {
        const imported: MainFile = JSON.parse(e.target?.result as string);
        if (mode === 'replace') {
          setMainFileName(imported.mainFileName);
          setTemplates(imported.templates);
          toast.success('Project replaced');
        } else {
          setTemplates([...templates, ...imported.templates]);
          toast.success('Templates merged');
        }
      } catch (error) {
        toast.error('Failed to import file');
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
    if (confirm(`Remove template "${name}"? You can restore it later.`)) {
      const template = templates.find(t => t.name === name);
      if (template) {
        setDeletedTemplates([...deletedTemplates, { ...template, deletedDate: new Date().toISOString() }]);
        setTemplates(templates.filter(t => t.name !== name));
        if (currentTemplateName === name) {
          setCurrentTemplateName('');
        }
        toast.success('Template removed');
      }
    }
  };

  const handleRestoreTemplate = (template: DeletedTemplate) => {
    setTemplates([...templates, { name: template.name, data: template.data, example: template.example }]);
    setDeletedTemplates(deletedTemplates.filter(t => t.name !== template.name || t.deletedDate !== template.deletedDate));
    toast.success('Template restored');
  };

  const handleImportTemplate = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.name && imported.data) {
          setTemplates([...templates, imported]);
          toast.success('Template imported');
        } else {
          toast.error('Invalid template file');
        }
      } catch (error) {
        toast.error('Failed to import template');
      }
    };
    reader.readAsText(file);
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
    if (mode === 'replace') {
      setTemplates(templatesToImport);
      toast.success(`Replaced all templates with ${templatesToImport.length} imported template(s)`);
    } else {
      setTemplates([...templates, ...templatesToImport]);
      toast.success(`Merged ${templatesToImport.length} template(s) into collection`);
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
    if (confirm('Clear all output text?')) {
      setOutput('');
      toast.success('Output cleared');
    }
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
      <div className="min-h-screen bg-gray-50 p-8">
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

        <Toaster position="bottom-right" />
      </div>
    </DndProvider>
  );
}
