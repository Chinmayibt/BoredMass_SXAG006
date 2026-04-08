import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { layoutWithDagre } from "../lib/graphLayout";
import ClusterGraphNode, { ClusterNodeData } from "./ClusterGraphNode";
import PaperGraphNode from "./PaperGraphNode";

const nodeTypes = { paper: PaperGraphNode, cluster: ClusterGraphNode };

type Props = {
  nodes: Node[];
  edges: Edge[];
  onSelectPaper?: (paperId: string) => void;
  onToggleCluster?: (clusterId: number) => void;
  fitViewSignal?: number;
};

export default function GraphView({ nodes, edges, onSelectPaper, onToggleCluster, fitViewSignal }: Props) {
  const rfRef = useRef<ReactFlowInstance | null>(null);

  const initial = useMemo(() => {
    if (!nodes.length) {
      return { nodes: [] as Node[], edges: [] as Edge[] };
    }
    return layoutWithDagre(nodes, edges, "TB");
  }, [nodes, edges]);

  const [rfNodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  useEffect(() => {
    setNodes(initial.nodes);
    setEdges(initial.edges);
  }, [initial, setNodes, setEdges]);

  useEffect(() => {
    if (!initial.nodes.length || fitViewSignal === undefined || fitViewSignal <= 0) return;
    const t = window.setTimeout(() => {
      rfRef.current?.fitView({ padding: 0.15, duration: 320 });
    }, 50);
    return () => window.clearTimeout(t);
  }, [fitViewSignal, initial.nodes.length]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === "cluster") {
        const cid = (node.data as ClusterNodeData).clusterId;
        if (cid !== undefined) onToggleCluster?.(cid);
        return;
      }
      onSelectPaper?.(node.id);
    },
    [onSelectPaper, onToggleCluster]
  );

  if (!nodes.length) {
    return (
      <div className="graph-empty">
        <p className="muted">No graph data for current filters. Adjust filters or run research to populate the map.</p>
      </div>
    );
  }

  return (
    <div className="graph-flow-host">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={(inst) => {
          rfRef.current = inst;
          inst.fitView({ padding: 0.12 });
        }}
        minZoom={0.15}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={18} />
        <Controls />
        <MiniMap pannable zoomable className="graph-minimap" />
      </ReactFlow>
    </div>
  );
}
