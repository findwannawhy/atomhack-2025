// components/NoProjects.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface NoProjectsProps {
  onCreateProjectClick: () => void;
}

const NoProjects: React.FC<NoProjectsProps> = ({ onCreateProjectClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-xl mb-4">Создайте свой первый проект!</h2>
      <Button onClick={onCreateProjectClick}>Создать проект</Button>
    </div>
  );
};

export default NoProjects;
