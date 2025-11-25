import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { StepData } from '../App';

interface ValidationRule {
  id: string;
  label: string;
  check: (step: StepData) => boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

const validationRules: ValidationRule[] = [
  {
    id: 'prompt-not-empty',
    label: 'Prompt is not empty',
    check: (step) => step.prompt.trim().length > 0,
    severity: 'error',
    message: 'Prompt cannot be empty',
  },
  {
    id: 'all-thoughts-filled',
    label: 'All thoughts have content',
    check: (step) => step.thoughts.every(t => t.content.trim().length > 0),
    severity: 'error',
    message: 'All three thoughts must have content',
  },
  {
    id: 'thought-min-length',
    label: 'Thoughts meet minimum length (20 chars)',
    check: (step) => step.thoughts.every(t => t.content.trim().length >= 20),
    severity: 'warning',
    message: 'Each thought should be at least 20 characters',
  },
  {
    id: 'no-duplicate-thoughts',
    label: 'No duplicate thought content',
    check: (step) => {
      const contents = step.thoughts.map(t => t.content.trim().toLowerCase());
      return new Set(contents).size === contents.length;
    },
    severity: 'warning',
    message: 'Thoughts should not be duplicates',
  },
  {
    id: 'quality-threshold',
    label: 'Quality score above 70',
    check: (step) => step.qualityScore >= 70,
    severity: 'info',
    message: 'Consider improving quality score',
  },
  {
    id: 'has-reasoning-words',
    label: 'Contains reasoning indicators',
    check: (step) => {
      const reasoningWords = ['because', 'therefore', 'thus', 'since', 'so', 'consequently', 'first', 'second', 'finally'];
      const allText = step.thoughts.map(t => t.content.toLowerCase()).join(' ');
      return reasoningWords.some(word => allText.includes(word));
    },
    severity: 'info',
    message: 'Good practice to include reasoning indicators',
  },
];

interface ValidationPanelProps {
  step: StepData;
}

export function ValidationPanel({ step }: ValidationPanelProps) {
  const results = validationRules.map(rule => ({
    rule,
    passed: rule.check(step),
  }));

  const errors = results.filter(r => !r.passed && r.rule.severity === 'error');
  const warnings = results.filter(r => !r.passed && r.rule.severity === 'warning');
  const infos = results.filter(r => !r.passed && r.rule.severity === 'info');

  const getIcon = (severity: string, passed: boolean) => {
    if (passed) {
      return <CheckCircle2 className="size-4 text-green-600" />;
    }
    switch (severity) {
      case 'error':
        return <XCircle className="size-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="size-4 text-yellow-600" />;
      case 'info':
        return <Info className="size-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm">Validation Checks</h3>
        <div className="flex items-center gap-2 text-xs">
          {errors.length > 0 && (
            <span className="text-red-600">{errors.length} error{errors.length !== 1 ? 's' : ''}</span>
          )}
          {warnings.length > 0 && (
            <span className="text-yellow-600">{warnings.length} warning{warnings.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {results.map(({ rule, passed }) => (
          <div
            key={rule.id}
            className={`flex items-start gap-3 p-2 rounded border ${
              passed
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                : rule.severity === 'error'
                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                : rule.severity === 'warning'
                ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
                : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
            }`}
          >
            <div className="pt-0.5">{getIcon(rule.severity, passed)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm">{rule.label}</div>
              {!passed && (
                <div className="text-xs text-muted-foreground mt-1">
                  {rule.message}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
