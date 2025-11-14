import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X } from 'lucide-react';

interface PhraseButtonProps {
  text: string;
  index: number;
  rowIndex: number;
  colIndex: number;
  onButtonClick: (text: string) => void;
  onButtonDelete: (index: number) => void;
  onButtonEdit: (index: number, newText: string) => void;
}

export function PhraseButton({
  text,
  index,
  rowIndex,
  colIndex,
  onButtonClick,
  onButtonDelete,
  onButtonEdit
}: PhraseButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'BUTTON',
    item: { buttonText: text, fromRow: rowIndex, fromCol: colIndex, buttonIndex: index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const handleSave = () => {
    if (tempText.trim()) {
      onButtonEdit(index, tempText.trim());
    }
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    setTempText(text);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <Input
        value={tempText}
        onChange={(e) => setTempText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') {
            setIsEditing(false);
            setTempText(text);
          }
        }}
        autoFocus
        className="h-9"
      />
    );
  }

  return (
    <div
      ref={drag}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${isDragging ? 'opacity-50' : ''}`}
    >
      <Button
        onClick={() => onButtonClick(text)}
        onDoubleClick={handleDoubleClick}
        variant="secondary"
        size="sm"
        className="w-full justify-start cursor-pointer whitespace-normal break-words text-left h-auto py-2 items-start leading-normal"
      >
        {text}
      </Button>
      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onButtonDelete(index);
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
