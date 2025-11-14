import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { GridCell } from './GridCell';
import { Plus } from 'lucide-react';
import type { Cell } from '../App';

interface GridWorkspaceProps {
  grid: (Cell | null)[][];
  onGridChange: (grid: (Cell | null)[][]) => void;
  onAddButtonText: (text: string) => void;
}

export function GridWorkspace({ grid, onGridChange, onAddButtonText }: GridWorkspaceProps) {
  const handleConvertToCell = (rowIndex: number, colIndex: number) => {
    const newGrid = grid.map((row, r) =>
      row.map((cell, c) => {
        if (r === rowIndex && c === colIndex && cell === null) {
          return { title: `Cell ${rowIndex + 1}-${colIndex + 1}`, buttons: [] };
        }
        return cell;
      })
    );
    onGridChange(newGrid);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, cell: Cell | null) => {
    const newGrid = grid.map((row, r) =>
      row.map((c, i) => (r === rowIndex && i === colIndex ? cell : c))
    );
    onGridChange(newGrid);
  };

  const handleSwapCells = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const newGrid = grid.map(row => [...row]);
    const temp = newGrid[fromRow][fromCol];
    newGrid[fromRow][fromCol] = newGrid[toRow][toCol];
    newGrid[toRow][toCol] = temp;
    onGridChange(newGrid);
  };

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {row.map((cell, colIndex) => {
            if (cell === null) {
              return (
                <EmptyCell
                  key={`${rowIndex}-${colIndex}`}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  onConvert={handleConvertToCell}
                  onDrop={handleSwapCells}
                />
              );
            }
            return (
              <GridCell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                rowIndex={rowIndex}
                colIndex={colIndex}
                onCellChange={handleCellChange}
                onAddButtonText={onAddButtonText}
                onSwapCells={handleSwapCells}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface EmptyCellProps {
  rowIndex: number;
  colIndex: number;
  onConvert: (rowIndex: number, colIndex: number) => void;
  onDrop: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
}

function EmptyCell({ rowIndex, colIndex, onConvert, onDrop }: EmptyCellProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'CELL',
    drop: (item: { rowIndex: number; colIndex: number }) => {
      onDrop(item.rowIndex, item.colIndex, rowIndex, colIndex);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  return (
    <div
      ref={drop}
      onClick={() => onConvert(rowIndex, colIndex)}
      className={`flex-1 min-w-[200px] min-h-[150px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      <Plus className="w-8 h-8 text-gray-400 mb-2" />
      <div className="text-sm text-gray-500">
        R{rowIndex + 1}C{colIndex + 1}
      </div>
    </div>
  );
}
