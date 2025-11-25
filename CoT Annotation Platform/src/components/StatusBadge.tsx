import { Status } from '../App';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: Status;
  onChange?: (status: Status) => void;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  'in-review': {
    label: 'In Review',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  archived: {
    label: 'Archived',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  },
};

export function StatusBadge({ status, onChange }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!onChange) {
    return <Badge className={config.className}>{config.label}</Badge>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <Badge className={`${config.className} cursor-pointer hover:opacity-80`}>
            {config.label}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {(Object.keys(statusConfig) as Status[]).map((statusKey) => (
          <DropdownMenuItem key={statusKey} onClick={() => onChange(statusKey)}>
            <Badge className={statusConfig[statusKey].className}>
              {statusConfig[statusKey].label}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
