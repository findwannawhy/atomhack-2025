import React from "react";
import { Button } from "@/components/ui/button";
import { Edge } from "@xyflow/react";
import { EdgeData } from "@/pages/DashboardGraph";
import { Node } from "@xyflow/react";
import { FlaskData } from "@/pages/DashboardGraph";

interface SidebarProps {
  selectedNodeId: string | null;
  nodes: Node<FlaskData>[];
  selectedEdge: Edge<EdgeData> | null;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedNodeId, nodes, selectedEdge, closeSidebar }) => {
  if (!selectedNodeId && !selectedEdge) return null;

  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  return (
    <div className="fixed top-40 right-4 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {selectedNode ? "Информация о колбе" : "Информация о соединении"}
        </h3>
        <Button onClick={closeSidebar} variant="outline">
          ✕
        </Button>
      </div>
      <div className="text-sm text-gray-600">
        {selectedNode ? (
          <>
            <p>
              <strong>Название:</strong> {selectedNode.data.name}
            </p>
            <p>
              <strong>Объем:</strong> {selectedNode.data.volume}
            </p>
            <p>
              <strong>Уровень жидкости:</strong> {selectedNode.data.liquid_level}
            </p>
            <p>
              <strong>Давление:</strong> {selectedNode.data.pressure}
            </p>
          </>
        ) : selectedEdge ? (
          <p>
            <strong>Диаметр:</strong> {selectedEdge.data?.diameter ?? "Нет данных"}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Sidebar;
