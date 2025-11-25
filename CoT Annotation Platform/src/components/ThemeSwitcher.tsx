import { Sun, Moon, Contrast } from 'lucide-react';
import { Theme } from '../App';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

interface ThemeSwitcherProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export function ThemeSwitcher({ theme, onChange }: ThemeSwitcherProps) {
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="size-4" />;
      case 'dark':
        return <Moon className="size-4" />;
      case 'high-contrast':
        return <Contrast className="size-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" title="Change theme">
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChange('light')}>
          <Sun className="size-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('dark')}>
          <Moon className="size-4 mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('high-contrast')}>
          <Contrast className="size-4 mr-2" />
          High Contrast
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
