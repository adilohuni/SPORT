import { useState } from 'react';
import { Button } from './ui/button';
import { Plus, Minus } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { toast } from 'sonner';
import type { Cell } from '../App';

interface GridControlsProps {
  grid: (Cell | null)[][];
  onGridChange: (grid: (Cell | null)[][]) => void;
}

export function GridControls({ grid, onGridChange }: GridControlsProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  const handleAddColumn = () => {
    const newGrid = grid.map(row => [...row, null]);
    onGridChange(newGrid);
  };

  const handleRemoveColumn = () => {
    if (grid[0].length <= 1) {
      toast.error('Grid must have at least 1 column');
      return;
    }
    
    // Check if last column has any populated cells
    const hasPopulatedCells = grid.some(row => row[row.length - 1] !== null);
    if (hasPopulatedCells) {
      setConfirmDialog({
        open: true,
        title: 'Remove Column',
        description: 'Remove the rightmost column? This will delete any cells in that column.',
        onConfirm: () => {
          const newGrid = grid.map(row => row.slice(0, -1));
          onGridChange(newGrid);
          setConfirmDialog({ open: false, title: '', description: '', onConfirm: () => {} });
          toast.success('Column removed');
        },
      });
    } else {
      const newGrid = grid.map(row => row.slice(0, -1));
      onGridChange(newGrid);
      toast.success('Column removed');
    }
  };

  const handleAddRow = () => {
    const newRow = Array(grid[0].length).fill(null);
    onGridChange([...grid, newRow]);
  };

  const handleRemoveRow = () => {
    if (grid.length <= 1) {
      toast.error('Grid must have at least 1 row');
      return;
    }
    
    // Check if last row has any populated cells
    const hasPopulatedCells = grid[grid.length - 1].some(cell => cell !== null);
    if (hasPopulatedCells) {
      setConfirmDialog({
        open: true,
        title: 'Remove Row',
        description: 'Remove the bottom row? This will delete any cells in that row.',
        onConfirm: () => {
          onGridChange(grid.slice(0, -1));
          setConfirmDialog({ open: false, title: '', description: '', onConfirm: () => {} });
          toast.success('Row removed');
        },
      });
    } else {
      onGridChange(grid.slice(0, -1));
      toast.success('Row removed');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Columns:</span>
            <Button onClick={handleAddColumn} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button onClick={handleRemoveColumn} variant="outline" size="sm">
              <Minus className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>

          <div className="h-6 w-px bg-muted" />

          <div className="flex items-center gap-2">
            <span className="text-sm">Rows:</span>
            <Button onClick={handleAddRow} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button onClick={handleRemoveRow} variant="outline" size="sm">
              <Minus className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Grid: {grid.length} × {grid[0].length}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ open: false, title: '', description: '', onConfirm: () => {} })}
        confirmText="Remove"
        isDangerous
      />
    </>
  );
}
