// components/EditorButtons.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface EditorButtonsProps {
  onAddFlask: () => void;
  onSaveEdits: () => void;
}

const EditorButtons: React.FC<EditorButtonsProps> = ({ onAddFlask, onSaveEdits }) => {
  return (
    <div className="flex items-center gap-4">
      <Button onClick={onAddFlask}>Добавить колбу</Button>
      <Button onClick={onSaveEdits}>Сохранить изменения</Button>
    </div>
  );
};

export default EditorButtons;
