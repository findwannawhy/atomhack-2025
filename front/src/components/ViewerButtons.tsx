// components/ViewerButtons.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface ViewerButtonsProps {
  onStartSimulation: () => void;
  onDeleteProject: () => void;
  onEdit: () => void;
  simulationRunning: boolean;
  onStopSimulation: () => void;
}

const ViewerButtons: React.FC<ViewerButtonsProps> = ({
  onStartSimulation,
  onDeleteProject,
  onEdit,
  simulationRunning,
  onStopSimulation,
}) => {
  return (
    <div className="flex items-center gap-4">
      {simulationRunning ? (
        <Button onClick={onStopSimulation}>Остановить эмуляцию</Button>
      ) : (
        <Button onClick={onStartSimulation}>Запустить эмуляцию</Button>
      )}
      <Button onClick={onDeleteProject} disabled={simulationRunning}>
        Удалить проект
      </Button>
      <Button onClick={onEdit} disabled={simulationRunning}>
        Редактировать
      </Button>
    </div>
  );
};

export default ViewerButtons;
