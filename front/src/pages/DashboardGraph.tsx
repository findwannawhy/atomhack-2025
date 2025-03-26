import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import ProjectSelector from "@/components/ProjectSelector";
import EditorButtons from "@/components/EditorButtons";
import ViewerButtons from "@/components/ViewerButtons";
import Sidebar from "@/components/Sidebar";
import UserInfo from "@/components/UserInfo";
import LogoutButton from "@/components/LogoutButton";

// Интерфейсы
export interface FlaskData {
  name?: string;
  volume?: number;
  liquid_level?: number;
  pressure?: number;
  nodeId?: number;
  [key: string]: unknown;
}

export interface EdgeData {
  diameter: number;
  [key: string]: unknown;
}

export interface Project {
  project_id: number;
  label: string;
  initial_liquid_level: number;
  nodeIds: string[];
  volumes: number[];
  liquid_levels: number[];
  pressures: number[];
  matrix: number[][];
}

interface FlaskNodeProps {
  data: { name: string; volume: number; liquid_level: number; pressure: number };
  id: string;
  setSelectedNodeId: (id: string) => void;
}

// Кастомный узел (колба)
const FlaskNode = ({ data, id, setSelectedNodeId }: FlaskNodeProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(id);
    console.log("Selected node updated:", id);
  };

  const formatNumber = (num: number | undefined) =>
    num !== undefined ? num.toString() : "—";

  return (
    <div
      onClick={handleClick}
      className="p-2 border-2 border-gray-800 rounded-xl bg-white text-center min-w-[100px] shadow hover:shadow-lg cursor-pointer break-words"
    >
      <strong className="text-xs">{`Колба ${data.name}`}</strong>
      <div className="text-[8px] mt-1">
        Объем колбы:<br />
        {formatNumber(data.volume)}
      </div>
      <div className="text-[8px]">
        Объем жидкости:<br />
        {formatNumber(data.liquid_level)}
      </div>
      <div className="text-[8px]">
        Давление в колбе:<br />
        {formatNumber(data.pressure)}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="bg-gray-800"
        onClick={handleClick}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="bg-gray-800"
        onClick={handleClick}
      />
    </div>
  );
};

const DashboardGraph: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [flaskModalOpen, setFlaskModalOpen] = useState(false);
  const [edgeModalOpen, setEdgeModalOpen] = useState(false);
  const [projectLabel, setProjectLabel] = useState("");
  const [initialVolumeInput, setInitialVolumeInput] = useState("");
  const [graphCounter, setGraphCounter] = useState(0);
  const [newFlaskVolume, setNewFlaskVolume] = useState("");
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [newEdgeDiameter, setNewEdgeDiameter] = useState("");
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeData> | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlaskData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([]);
  const [withCredentialse] = useState(false);

  // 1. Загрузка проектов
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:3100/get_projects", {
          withCredentials: withCredentialse,
          headers: { "Content-Type": "application/json" },
        });
        setProjects(response.data.projects);
      } catch (error) {
        console.error("Ошибка при получении проектов:", error);
      }
    };
    fetchProjects();
  }, []);

  // 2. Сохранение изменений на сервере
  const updateProjectOnServer = async (proj: Project) => {
    const body = {
      project_id: proj.project_id,
      project_data: {
        label: proj.label,
        initial_liquid_level: proj.initial_liquid_level,
        nodeIds: proj.nodeIds,
        volumes: proj.volumes,
        liquid_levels: proj.liquid_levels,
        pressures: proj.pressures,
        matrix: proj.matrix,
      },
    };
    try {
      await axios.put("http://localhost:3100/edit_graph/", body, {
        withCredentials: withCredentialse,
        headers: { "Content-Type": "application/json" },
      });
      console.log("Проект обновлён на сервере");
    } catch (error) {
      console.error("Ошибка при обновлении проекта на сервере:", error);
    }
  };

  // 3. Загрузка конкретного графа
  const loadGraph = async (projectId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:3100/get_graph/?project_id=${projectId}`,
        {
          withCredentials: withCredentialse,
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = response.data;
      if (!simulationRunning) {
        const resetLiquidLevels = data.volumes.map(
          () => data.initial_liquid_level
        );
        const resetPressures = data.volumes.map(() => 0);
        data.liquid_level = resetLiquidLevels;
        data.pressures = resetPressures;
      }
      const nodeIds =
        data.nodeIds ||
        data.volumes.map((_: number, index: number) => index.toString());

      setProject({
        project_id: projectId,
        label: data.label,
        initial_liquid_level: data.initial_liquid_level,
        nodeIds: data.nodeIds,
        volumes: data.volumes,
        liquid_levels: data.liquid_level,
        pressures: data.pressures,
        matrix: data.matrix,
      });

      const loadedNodes = nodeIds.map((nodeId: string, index: number) => ({
        id: nodeId,
        type: "default",
        position: { x: 100 + index * 120, y: 140 + index * 120 },
        data: {
          name: (index + 1).toString(),
          volume: data.volumes[index],
          liquid_level: data.liquid_level[index],
          pressure: data.pressures[index] || 0,
        },
      }));

      const loadedEdges: Edge<EdgeData>[] = [];
      for (let i = 0; i < data.matrix.length; i++) {
        for (let j = i + 1; j < data.matrix[i].length; j++) {
          if (data.matrix[i][j] !== 0) {
            loadedEdges.push({
              id: `e${nodeIds[i]}-${nodeIds[j]}`,
              source: nodeIds[i],
              target: nodeIds[j],
              data: { diameter: data.matrix[i][j] },
            });
          }
        }
      }
      setNodes((prev) => [...prev, ...loadedNodes] as Node<FlaskData>[]);
      setEdges(loadedEdges);
    } catch (error) {
      console.error("Ошибка при загрузке графа:", error);
    }
  };

  // 4. Создание нового проекта
  const handleNewProjectButton = async () => {
    if (project && isEditing) {
      const confirmed = window.confirm(
        "У вас есть несохранённый проект. Сохранить его?"
      );
      if (confirmed) {
        await handleSaveEditsButton();
      } else {
        setIsEditing(false);
      }
    }
    setProjectModalOpen(true);
  };

  // 5. Подтверждение создания проекта
  const handleCreateProjectButton = async () => {
    const initialLiquidLevel = Number(initialVolumeInput);
    if (isNaN(initialLiquidLevel) || !projectLabel) return;
    const newProjectId = graphCounter + 1;
    const newProject: Project = {
      project_id: newProjectId,
      label: projectLabel,
      initial_liquid_level: initialLiquidLevel,
      nodeIds: [],
      volumes: [],
      liquid_levels: [],
      pressures: [],
      matrix: [],
    };
    setProjects((prev) => [...prev, newProject]);
    setProject(newProject);
    setGraphCounter(newProjectId);
    setProjectModalOpen(false);
    setNodes([]);
    setEdges([]);
    await saveProject(newProject);
    setIsEditing(true);
  };

  // 6. Сохранение проекта (POST)
  const saveProject = async (proj: Project) => {
    const body = {
      project_id: proj.project_id,
      project_data: {
        label: proj.label,
        initial_liquid_level: proj.initial_liquid_level,
        nodeIds: proj.nodeIds,
        volumes: proj.volumes,
        liquid_levels: proj.liquid_levels,
        pressures: proj.pressures,
        matrix: proj.matrix,
      },
    };

    try {
      await axios.post("http://localhost:3100/create_graph/", body, {
        withCredentials: withCredentialse,
        headers: { "Content-Type": "application/json" },
      });
      console.log("Проект сохранён");
    } catch (error) {
      console.error("Ошибка при сохранении проекта:", error);
    }
  };

  // 7. Переход в режим редактирования
  const handleOpenEditorButton = () => {
    setIsEditing(true);
  };

  // 8. Сохранение изменений (PUT)
  const handleSaveEditsButton = async () => {
    if (!project) return;

    const body = {
      project_id: project.project_id,
      project_data: {
        label: project.label,
        initial_liquid_level: project.initial_liquid_level,
        nodeIds: project.nodeIds,
        volumes: project.volumes,
        liquid_levels: project.liquid_levels,
        pressures: project.pressures,
        matrix: project.matrix,
      },
    };

    try {
      await axios.put(
        `http://localhost:3100/edit_graph/?project_id=${project.project_id}`,
        body,
        {
          withCredentials: withCredentialse,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Проект отредактирован");
    } catch (error) {
      console.error("Ошибка при редактировании проекта:", error);
    } finally {
      setIsEditing(false);
    }
  };

  // 9. Удаление проекта
  const handleDeleteProjectButton = async () => {
    if (!project) return;
    try {
      await axios.delete(
        `http://localhost:3100/delete_graph/?project_id=${project.project_id}`,
        {
          withCredentials: withCredentialse,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Проект удалён");
      const newProjects = projects.filter(
        (p) => p.project_id !== project.project_id
      );
      setIsEditing(false);
      setProjects(newProjects);
      if (newProjects.length > 0) {
        const sorted = [...newProjects].sort(
          (a, b) => a.project_id - b.project_id
        );
        const firstProject = sorted[0];
        setProject(firstProject);
        await loadGraph(firstProject.project_id);
      } else {
        setProject(null);
        setNodes([]);
        setEdges([]);
      }
    } catch (error) {
      console.error("Ошибка при удалении проекта:", error);
    }
  };

  // 10. Выбор проекта
  const handleChooseProjectCombobox = async (projectId: number) => {
    if (project && isEditing) {
      const confirmed = window.confirm(
        "У вас есть несохранённый проект. Сохранить его?"
      );
      if (confirmed) {
        await handleSaveEditsButton();
      } else {
        setIsEditing(false);
      }
    }
    const selectedProject =
      projects.find((p) => p.project_id === projectId) || null;
    setProject(selectedProject);
    if (selectedProject) {
      await loadGraph(selectedProject.project_id);
    }
  };

  // 11. Добавление колбы (нового узла)
  const handleAddFlask = () => {
    const volume = Number(newFlaskVolume);
    if (isNaN(volume) || !project) return;
    const newId = `node-${Date.now()}`;
    const newNode: Node<FlaskData> = {
      id: newId,
      type: "default",
      position: { x: 200, y: 200 },
      data: {
        name: (project.nodeIds.length + 1).toString(),
        volume,
        liquid_level: project.initial_liquid_level,
        pressure: 0,
      },
    };
    setNodes((prev) => [...prev, newNode] as Node<FlaskData>[]);
    setProject((prev) => {
      if (!prev) return prev;
      const newNodeIds = [...prev.nodeIds, newId];
      const newVolumes = [...prev.volumes, volume];
      const newLiquidLevels = [...prev.liquid_levels, prev.initial_liquid_level];
      const newPressures = [...prev.pressures, 0];
      const newMatrix = prev.matrix.map((row) => [...row, 0]);
      newMatrix.push(new Array(newVolumes.length).fill(0));
      return {
        ...prev,
        nodeIds: newNodeIds,
        volumes: newVolumes,
        liquid_levels: newLiquidLevels,
        pressures: newPressures,
        matrix: newMatrix,
      };
    });
    setFlaskModalOpen(false);
    setNewFlaskVolume("");
  };

  // 12. Добавление соединения (ребра)
  const onConnect = useCallback(
    (params: Connection) => {
      if (!isEditing) {
        alert("Включите режим редактирования для создания соединений.");
        return;
      }
      if (!params.source || !params.target) return;
      const edgeExists = edges.some(
        (edge) =>
          (edge.source === params.source && edge.target === params.target) ||
          (edge.source === params.target && edge.target === params.source)
      );
      if (edgeExists) return;
      setPendingConnection(params);
      setEdgeModalOpen(true);
    },
    [edges, isEditing]
  );

  const handleAddEdge = () => {
    if (!pendingConnection) return;
    const diameter = Number(newEdgeDiameter);
    if (isNaN(diameter)) return;
    const newEdge: Edge<EdgeData> = {
      id: `e${pendingConnection.source}-${pendingConnection.target}`,
      source: pendingConnection.source,
      target: pendingConnection.target,
      data: { diameter },
    };
    setEdges((eds) => addEdge(newEdge, eds));
    setProject((prev) => {
      if (!prev) return prev;
      const sourceIndex = prev.nodeIds.findIndex(
        (id) => id === pendingConnection.source
      );
      const targetIndex = prev.nodeIds.findIndex(
        (id) => id === pendingConnection.target
      );
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const updatedMatrix = prev.matrix.map((row) => [...row]);
        updatedMatrix[sourceIndex][targetIndex] = diameter;
        updatedMatrix[targetIndex][sourceIndex] = diameter;
        return { ...prev, matrix: updatedMatrix };
      }
      return prev;
    });
    setEdgeModalOpen(false);
    setPendingConnection(null);
    setNewEdgeDiameter("");
  };

  // 13. Эмуляция (запуск симуляции)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simulationRunning && project) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `http://localhost:3100/get_graph/?project_id=${project.project_id}`,
            {
              withCredentials: withCredentialse,
              headers: { "Content-Type": "application/json" },
            }
          );
          const data = response.data;
          setNodes((prevNodes) =>
            prevNodes.map((node) => {
              const idx = project.nodeIds.indexOf(node.id);
              if (idx === -1) return node;
              return {
                ...node,
                data: {
                  ...node.data,
                  liquid_level: data.liquid_level[idx],
                  pressure: data.pressures[idx] || 0,
                },
              };
            })
          );
        } catch (error) {
          console.error("Ошибка при симуляции:", error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [simulationRunning, project]);

  const handleStartSimulation = () => {
    console.log("Запуск симуляции");
    setSimulationRunning(true);
  };

  const handleStopSimulation = () => {
    console.log("Остановка симуляции");
    setSimulationRunning(false);
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          liquid_level: project?.initial_liquid_level,
          pressure: 0,
        },
      }))
    );
  };

  // 14. Выбор узла / ребра
  const onNodeClick = (_: React.MouseEvent, node: Node<FlaskData>) => {
    setSelectedNodeId(node.id);
    setSelectedEdge(null);
  };

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge<EdgeData>) => {
      setSelectedEdge(edge);
      setSelectedNodeId(null);
    },
    []
  );

  // Закрыть сайдбар
  const closeSidebar = () => {
    setSelectedNodeId(null);
    setSelectedEdge(null);
  };

  // 15. Удаление узла или ребра по Backspace
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const targetTag = (event.target as HTMLElement).tagName.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea") return;
      if (event.key !== "Backspace") return;
      event.preventDefault();
      if (!isEditing) {
        alert("Включите режим редактирования для удаления");
        return;
      }
      // Удаление узла
      if (selectedNodeId && project) {
        const nodeIndex = project.nodeIds.findIndex((id) => id === selectedNodeId);
        if (nodeIndex === -1) return;
        const updatedProject: Project = {
          ...project,
          nodeIds: project.nodeIds.filter((id) => id !== selectedNodeId),
          volumes: project.volumes.filter((_, idx) => idx !== nodeIndex),
          liquid_levels: project.liquid_levels.filter((_, idx) => idx !== nodeIndex),
          pressures: project.pressures.filter((_, idx) => idx !== nodeIndex),
          matrix: project.matrix
            .filter((_, idx) => idx !== nodeIndex)
            .map((row) => row.filter((_, idx) => idx !== nodeIndex)),
        };
        setNodes((prevNodes) =>
          prevNodes.filter((node) => node.id !== selectedNodeId)
        );
        setEdges((prevEdges) =>
          prevEdges.filter(
            (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId
          )
        );
        setProject(updatedProject);
        setSelectedNodeId(null);
        return;
      }
      // Удаление ребра
      if (selectedEdge && project) {
        const sourceIndex = project.nodeIds.findIndex((id) => id === selectedEdge.source);
        const targetIndex = project.nodeIds.findIndex((id) => id === selectedEdge.target);
        if (sourceIndex === -1 || targetIndex === -1) return;
        const updatedMatrix = project.matrix.map((row) => [...row]);
        updatedMatrix[sourceIndex][targetIndex] = 0;
        updatedMatrix[targetIndex][sourceIndex] = 0;
        const updatedProject: Project = { ...project, matrix: updatedMatrix };
        setEdges((prevEdges) =>
          prevEdges.filter((edge) => edge.id !== selectedEdge.id)
        );
        setProject(updatedProject);
        setSelectedEdge(null);
        await updateProjectOnServer(updatedProject);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, selectedNodeId, selectedEdge, project]);

  return (
    <div className="w-full h-screen relative">
      {/* Верхний правый угол с UserInfo и LogoutButton */}
      <div className="absolute top-0 right-0 z-50 flex items-center gap-4 p-4">
        <UserInfo />
        <LogoutButton />
      </div>

      {/* Если проектов нет – выводим кнопку "Создать проект" */}
      {projects.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <Button onClick={handleNewProjectButton}>Создать проект</Button>
        </div>
      ) : (
        <>
          {/* Секция выбора проекта */}
          <div className="p-4 flex items-center gap-4">
            <ProjectSelector
              projects={projects}
              currentProjectId={project?.project_id}
              onSelectProject={handleChooseProjectCombobox}
              disabled={simulationRunning}
            />
            <Button onClick={handleNewProjectButton} disabled={simulationRunning}>
              Создать проект
            </Button>
          </div>

          {/* Кнопки управления (режим редактора / просмотра) */}
          <div className="p-4">
            {isEditing ? (
              <EditorButtons
                onAddFlask={() => setFlaskModalOpen(true)}
                onSaveEdits={handleSaveEditsButton}
              />
            ) : (
              <ViewerButtons
                onStartSimulation={handleStartSimulation}
                onDeleteProject={handleDeleteProjectButton}
                onEdit={handleOpenEditorButton}
                simulationRunning={simulationRunning}
                onStopSimulation={handleStopSimulation}
              />
            )}
          </div>

          {/* Область графа */}
          <div className="w-full h-[calc(100%-160px)] border border-black rounded-md overflow-hidden">
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeClick={onEdgeClick}
                onNodeClick={onNodeClick}
                onPaneClick={() => {
                  setSelectedNodeId(null);
                  setSelectedEdge(null);
                }}
                fitView
                nodeTypes={{
                  default: (props) => (
                    <FlaskNode {...props} setSelectedNodeId={setSelectedNodeId} />
                  ),
                }}
              />
            </ReactFlowProvider>
          </div>

          {/* Сайдбар, если выбран узел или ребро */}
          {(selectedNodeId || selectedEdge) && (
            <Sidebar
              selectedNodeId={selectedNodeId}
              nodes={nodes}
              selectedEdge={selectedEdge}
              closeSidebar={closeSidebar}
            />
          )}
        </>
      )}

      {/* Модальное окно для создания проекта */}
      {projectModalOpen && (
        <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
          <DialogContent className="bg-white p-4 rounded shadow max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Новый проект</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                placeholder="Название проекта"
                value={projectLabel}
                onChange={(e) => setProjectLabel(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Начальный уровень жидкости"
                value={initialVolumeInput}
                onChange={(e) => setInitialVolumeInput(e.target.value)}
              />
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setProjectModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateProjectButton}>Создать</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Модальное окно для добавления колбы */}
      {flaskModalOpen && (
        <Dialog open={flaskModalOpen} onOpenChange={setFlaskModalOpen}>
          <DialogContent className="bg-white p-4 rounded shadow max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Добавить колбу</DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Объем колбы"
              value={newFlaskVolume}
              onChange={(e) => setNewFlaskVolume(e.target.value)}
              className="mt-2"
            />
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setFlaskModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddFlask}>Добавить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Модальное окно для добавления соединения */}
      {edgeModalOpen && (
        <Dialog open={edgeModalOpen} onOpenChange={setEdgeModalOpen}>
          <DialogContent className="bg-white p-4 rounded shadow max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Добавить соединение</DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Диаметр"
              value={newEdgeDiameter}
              onChange={(e) => setNewEdgeDiameter(e.target.value)}
              className="mt-2"
            />
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setEdgeModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddEdge}>Добавить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DashboardGraph;
