import { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { PhraseButton } from './PhraseButton';
import { ConfirmDialog } from './ConfirmDialog';
import { InputDialog } from './InputDialog';
import { toast } from 'sonner';
import type { Cell } from '../App';

interface GridCellProps {
  cell: Cell;
  rowIndex: number;
  colIndex: number;
  onCellChange: (rowIndex: number, colIndex: number, cell: Cell | null) => void;
  onAddButtonText: (text: string) => void;
  onSwapCells: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
}

export function GridCell({ cell, rowIndex, colIndex, onCellChange, onAddButtonText, onSwapCells }: GridCellProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(cell.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddButtonDialog, setShowAddButtonDialog] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'CELL',
    item: { rowIndex, colIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'CELL',
    drop: (item: { rowIndex: number; colIndex: number }) => {
      if (item.rowIndex !== rowIndex || item.colIndex !== colIndex) {
        onSwapCells(item.rowIndex, item.colIndex, rowIndex, colIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const [{ isOverButton }, dropButton] = useDrop({
    accept: 'BUTTON',
    drop: (item: { buttonText: string; fromRow: number; fromCol: number; buttonIndex: number }) => {
      if (item.fromRow === rowIndex && item.fromCol === colIndex) {
        return;
      }
      // Remove from source
      const sourceCell = { ...cell };
      if (item.fromRow !== rowIndex || item.fromCol !== colIndex) {
        onCellChange(item.fromRow, item.fromCol, {
          title: sourceCell.title,
          buttons: sourceCell.buttons.filter((_, i) => i !== item.buttonIndex)
        });
      }
      // Add to destination
      onCellChange(rowIndex, colIndex, {
        ...cell,
        buttons: [...cell.buttons, item.buttonText]
      });
    },
    collect: (monitor) => ({
      isOverButton: monitor.isOver()
    })
  });

  const handleDelete = () => {
    if (cell.buttons.length > 0) {
      setShowDeleteDialog(true);
    } else {
      onCellChange(rowIndex, colIndex, null);
      toast.success('Cell deleted');
    }
  };

  const handleDeleteConfirm = () => {
    onCellChange(rowIndex, colIndex, null);
    setShowDeleteDialog(false);
    toast.success('Cell deleted');
  };

  const handleTitleSave = () => {
    onCellChange(rowIndex, colIndex, { ...cell, title: tempTitle });
    setIsEditingTitle(false);
  };

  const handleAddButton = () => {
    setShowAddButtonDialog(true);
  };

  const handleAddButtonConfirm = (text: string) => {
    if (text.trim()) {
      onCellChange(rowIndex, colIndex, {
        ...cell,
        buttons: [...cell.buttons, text.trim()]
      });
      toast.success('Button added');
    }
    setShowAddButtonDialog(false);
  };

  const handleButtonDelete = (buttonIndex: number) => {
    onCellChange(rowIndex, colIndex, {
      ...cell,
      buttons: cell.buttons.filter((_, i) => i !== buttonIndex)
    });
  };

  const handleButtonEdit = (buttonIndex: number, newText: string) => {
    onCellChange(rowIndex, colIndex, {
      ...cell,
      buttons: cell.buttons.map((b, i) => (i === buttonIndex ? newText : b))
    });
  };

  return (
    <>
      <div
        ref={(node) => {
          preview(node);
          drop(node);
        }}
        className={`flex-1 min-w-[200px] border-2 rounded-lg p-4 transition-all ${
          isDragging ? 'opacity-50' : ''
        } ${isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <div ref={drag} className="cursor-move">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            {isEditingTitle ? (
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                autoFocus
                className="h-8"
              />
            ) : (
              <div
                onClick={() => {
                  setTempTitle(cell.title);
                  setIsEditingTitle(true);
                }}
                className="cursor-pointer hover:text-blue-600 break-words"
              >
                {cell.title}
              </div>
            )}
          </div>
          <Button onClick={handleDelete} variant="ghost" size="sm">
            <Trash2 className="w-4 h-4 text-gray-500" />
          </Button>
        </div>

        <div className="text-xs text-gray-500 mb-3">
          R{rowIndex + 1}C{colIndex + 1}
        </div>

        <Button onClick={handleAddButton} variant="outline" size="sm" className="w-full mb-3">
          <Plus className="w-4 h-4 mr-1" />
         Add Thought 
        </Button>

        <div
          ref={dropButton}
          className={`space-y-2 min-h-[50px] p-2 rounded border-2 border-dashed transition-colors break-words ${
            isOverButton ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          {cell.buttons.map((buttonText, index) => (
            <PhraseButton
              key={index}
              text={buttonText}
              index={index}
              rowIndex={rowIndex}
              colIndex={colIndex}
              onButtonClick={onAddButtonText}
              onButtonDelete={handleButtonDelete}
              onButtonEdit={handleButtonEdit}
            />
          ))}
          {cell.buttons.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-4">
              Drag buttons here or click Add Button
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Cell"
        description="Delete this cell and all its buttons?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText="Delete"
        isDangerous
      />

      <InputDialog
        open={showAddButtonDialog}
        title="Add Button"
        label="Button text"
        placeholder="Enter button text..."
        onConfirm={handleAddButtonConfirm}
        onCancel={() => setShowAddButtonDialog(false)}
        confirmText="Add"
      />
    </>
  );
}
