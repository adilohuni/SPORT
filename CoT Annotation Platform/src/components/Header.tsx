import { Settings, User, MessageSquare, Download, Check, Clock, Save, Menu } from 'lucide-react';
import { Theme, Status, RunData } from '../App';
import { StatusBadge } from './StatusBadge';
import { ThemeSwitcher } from './ThemeSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

interface HeaderProps {
  run: RunData | null;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onStatusChange: (status: Status) => void;
  onToggleComments: () => void;
  onExport: () => void;
  autoSaveStatus: 'saved' | 'saving' | 'unsaved';
  isReviewerMode: boolean;
  onToggleMenu?: () => void;
}

export function Header({
  run,
  theme,
  onThemeChange,
  onStatusChange,
  onToggleComments,
  onExport,
  autoSaveStatus,
  isReviewerMode,
  onToggleMenu,
}: HeaderProps) {
  return (
    <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
      <div className="flex items-center gap-4">
        <h1 className="text-lg">PromptGrid Studio</h1>
        {run && (
          <>
            <div className="h-6 w-px bg-border" />
            <span className="text-sm text-muted-foreground">{run.title}</span>
            <StatusBadge status={run.status} onChange={onStatusChange} />
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Auto-save indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {autoSaveStatus === 'saved' && (
            <>
              <Check className="size-3 text-green-600" />
              <span>Saved</span>
            </>
          )}
          {autoSaveStatus === 'saving' && (
            <>
              <Clock className="size-3 animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {autoSaveStatus === 'unsaved' && (
            <>
              <Save className="size-3" />
              <span>Unsaved changes</span>
            </>
          )}
        </div>

        {/* Mode indicator */}
        {isReviewerMode && (
          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
            Reviewer Mode
          </div>
        )}

        {/* Comments toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleComments}
          title="Toggle comments"
        >
          <MessageSquare className="size-4" />
        </Button>

        {/* Export button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          title="Export data"
        >
          <Download className="size-4" />
        </Button>

        {/* Theme switcher */}
        <ThemeSwitcher theme={theme} onChange={onThemeChange} />

        {/* Settings menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" title="Settings">
              <Settings className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Documentation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" title="User menu">
              <User className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Switch account</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menu toggle */}
        {onToggleMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMenu}
            title="Toggle menu"
          >
            <Menu className="size-4" />
          </Button>
        )}
      </div>
    </header>
  );
}