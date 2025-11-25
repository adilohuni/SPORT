interface QualityScoreProps {
  score: number;
  compact?: boolean;
}

export function QualityScore({ score, compact = false }: QualityScoreProps) {
  const getColor = () => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
  };

  if (compact) {
    return (
      <div
        className={`text-xs px-2 py-0.5 rounded ${getColor()}`}
        title="Quality Score"
      >
        {score}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Quality Score:</span>
      <div className={`text-sm px-3 py-1 rounded ${getColor()}`}>
        {score}/100
      </div>
    </div>
  );
}
