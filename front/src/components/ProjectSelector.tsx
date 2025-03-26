// components/ProjectSelector.tsx
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Project } from "@/pages/DashboardGraph"; // или откуда у вас импортируется интерфейс Project

interface ProjectSelectorProps {
  projects: Project[];
  currentProjectId?: number;
  onSelectProject: (projectId: number) => void;
  disabled?: boolean; // Новый пропс для блокировки
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  disabled = false
}) => {
  return (
    <Select
      value={currentProjectId ? currentProjectId.toString() : ""}
      onValueChange={(value) => onSelectProject(Number(value))}
      disabled={disabled} // Блокировка переключателя
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Выберите проект" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((p) => (
          <SelectItem key={`project-${p.project_id}`} value={p.project_id.toString()}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ProjectSelector;
