import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, Trash2, FileText, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';
import { json } from '@codemirror/lang-json';
import { LocalLinter, binaryInlined } from 'harper.js';

interface OutputAreaProps {
  output: string;
  onOutputChange: (value: string) => void;
  onClear: () => void;
  onCopy: () => void;
  onShowExample: () => void;
  hasExample: boolean;
  onValidateJson?: () => void;
}

interface HarperError {
  message: string;
  text: string;
  span: {
    start: number;
    end: number;
  };
}

export function OutputArea({ output, onOutputChange, onClear, onCopy, onShowExample, hasExample, onValidateJson}: OutputAreaProps) {
  const [grammarErrors, setGrammarErrors] = useState<HarperError[]>([]);
  const linterRef = useRef<LocalLinter | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [vimEnabled, setVimEnabled] = useState(false);
  const [vimMode, setVimMode] = useState<'normal' | 'insert'>('insert');
  const editorParentRef = useRef<HTMLDivElement | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const editableCompRef = useRef<Compartment | null>(null);
  const vimModeRef = useRef<'normal' | 'insert'>(vimMode);
  const domKeyHandlerRef = useRef<((ev: KeyboardEvent) => void) | null>(null);
  const [editorReady, setEditorReady] = useState(false);

  // Initialize the linter
  useEffect(() => {
    const initializeLinter = async () => {
      try {
        const linter = new LocalLinter({ binary: binaryInlined });
        await linter.setup();
        linterRef.current = linter;
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Harper linter:', error);
      }
    };

    initializeLinter();
  }, []);

  // Check grammar when output changes
  useEffect(() => {
    if (!output.trim()) {
      setGrammarErrors([]);
      return;
    }
    if (!output.trim() || !isInitialized || !linterRef.current) {
      setGrammarErrors([]);
      return;
    }

    const checkGrammar = async () => {
      try {
        if (!linterRef.current) return;
        const lints = await linterRef.current.lint(output);
        const errors: HarperError[] = lints.map((lint) => ({
          message: lint.message(),
          text: lint.get_problem_text(),
          span: {
            start: lint.span().start,
            end: lint.span().end,
          },
        }));
        setGrammarErrors(errors);
      } catch (error) {
        console.error('Grammar check error:', error);
      }
    };

    const debounceTimer = setTimeout(checkGrammar, 500);
    return () => clearTimeout(debounceTimer);
  }, [output]);

  const errorCount = grammarErrors.length;

  // Initialize CodeMirror editor
  useEffect(() => {
    let mounted = true;
    const create = async () => {
      if (!editorParentRef.current) return;
      // If an editor already exists, destroy it first
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
        editorViewRef.current = null;
      }

      const editableComp = new Compartment();
      editableCompRef.current = editableComp;
      const extensions: any[] = [basicSetup, json(), editableComp.of(EditorView.editable.of(!vimEnabled)), EditorView.updateListener.of((update: any) => {
        if (update.docChanged) {
          const doc = update.state.doc.toString();
          onOutputChange(doc);
        }
      })];

      if (vimEnabled) {
        try {
          const mod = await import('@replit/codemirror-vim');
          if (mod && mod.vim) {
            extensions.push(mod.vim());
          }
        } catch (err) {
          console.error('Failed to load vim extension:', err);
        }
      }

      const state = EditorState.create({
        doc: output,
        extensions,
      });

      const view = new EditorView({
        state,
        parent: editorParentRef.current,
      });

      editorViewRef.current = view;
      setEditorReady(true);
      // Make editor readonly in 'normal' mode so typing is blocked; toggle insert/normal via simple DOM handlers
      const domHandler = (ev: KeyboardEvent) => {
        if (!editorViewRef.current) return;
        if (!vimEnabled) return;
        const isInsert = vimModeRef.current === 'insert';
        if (!isInsert && ev.key === 'i') {
          ev.preventDefault();
          setVimMode('insert');
          const comp = editableCompRef.current;
          if (comp && editorViewRef.current) editorViewRef.current.dispatch({ effects: comp.reconfigure(EditorView.editable.of(true)) });
          editorViewRef.current.focus();
        } else if (isInsert && ev.key === 'Escape') {
          ev.preventDefault();
          setVimMode('normal');
          const comp = editableCompRef.current;
          if (comp && editorViewRef.current) editorViewRef.current.dispatch({ effects: comp.reconfigure(EditorView.editable.of(false)) });
          editorViewRef.current.focus();
        }
      };

      domKeyHandlerRef.current = domHandler;
      view.dom.addEventListener('keydown', domHandler);

      // update mode badge: when vim extension registers mode changes, it may provide API; keep a simple approach
      if (mounted && vimEnabled) setVimMode('normal');
    };

    create();

    return () => {
      mounted = false;
      if (editorViewRef.current) {
        // remove the handler we attached
        try {
          const h = domKeyHandlerRef.current;
          if (h) editorViewRef.current.dom.removeEventListener('keydown', h);
        } catch (e) {
          // ignore
        }
        editorViewRef.current.destroy();
        editorViewRef.current = null;
        setEditorReady(false);
      }
    };
  }, [vimEnabled]);

  // keep vimModeRef in sync with state
  useEffect(() => { vimModeRef.current = vimMode; }, [vimMode]);

  // when vimMode changes, reconfigure editable compartment if editor exists
  useEffect(() => {
    const comp = editableCompRef.current;
    const view = editorViewRef.current;
    if (comp && view) {
      const makeEditable = vimMode === 'insert';
      view.dispatch({ effects: comp.reconfigure(EditorView.editable.of(makeEditable)) });
    }
  }, [vimMode]);

  // Keep editor content in sync when `output` prop changes externally
  useEffect(() => {
    const view = editorViewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== output) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: output },
      });
    }
  }, [output]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Output</CardTitle>
            {errorCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errorCount} issue{errorCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setVimEnabled((v) => {
                    const next = !v;
                    if (next) setVimMode('normal');
                    else setVimMode('insert');
                    return next;
                  });
                }}
                variant={vimEnabled ? 'default' : 'outline'}
                size="sm"
              >
                Vim
              </Button>
              {vimEnabled && (
                <div className="px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs">
                  {vimMode === 'normal' ? 'NORMAL' : 'INSERT'}
                </div>
              )}
            </div>
            {hasExample && (
              <Button onClick={onShowExample} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-1" />
                Example
              </Button>
            )}
            <Button onClick={onValidateJson} variant="outline" size="sm" disabled={!output}>
              Validate JSON
            </Button>
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
        {editorReady ? (
          <div
            ref={editorParentRef}
            className="min-h-[120px] resize-none border rounded p-1"
          />
        ) : (
          <textarea
            id="output-textarea"
            value={output}
            onChange={(e) => onOutputChange(e.target.value)}
            placeholder="Click buttons below to compose your text..."
            className="min-h-[120px] resize-none w-full border rounded p-2"
          />
        )}
        {grammarErrors.length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h4 className="font-semibold text-sm text-amber-900 mb-3">Grammar Issues:</h4>
            <ul className="space-y-2">
              {grammarErrors.slice(0, 5).map((error, index) => (
                <li key={index} className="text-sm text-amber-800 leading-relaxed">
                  <span className="font-medium">"{error.text}"</span>: {error.message}
                </li>
              ))}
              {grammarErrors.length > 5 && (
                <li className="text-sm text-amber-700 italic">
                  +{grammarErrors.length - 5} more issue{grammarErrors.length - 5 !== 1 ? 's' : ''}
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
