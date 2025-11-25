import { CheckCircle2, AlertCircle } from 'lucide-react';
import { StepData } from '../App';
import { QualityScore } from './QualityScore';

interface StepNodeProps {
  step: StepData;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function StepNode({ step, index, isActive, onClick }: StepNodeProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isActive
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card hover:bg-accent border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs ${isActive ? 'opacity-90' : 'text-muted-foreground'}`}>
              Step {index + 1}
            </span>
            {step.validated ? (
              <CheckCircle2 className="size-3 text-green-600" />
            ) : step.validationIssues.length > 0 ? (
              <AlertCircle className="size-3 text-yellow-600" />
            ) : null}
          </div>
          <div className={`text-sm truncate ${isActive ? '' : 'text-foreground'}`}>
            {step.nodeId}
          </div>
          {step.subtask && (
            <div className={`text-xs mt-1 ${isActive ? 'opacity-75' : 'text-muted-foreground'}`}>
              {step.subtask}
            </div>
          )}
        </div>
        <QualityScore score={step.qualityScore} compact />
      </div>
    </button>
  );
}
