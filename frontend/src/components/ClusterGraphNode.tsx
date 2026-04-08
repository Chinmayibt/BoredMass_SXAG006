import React, { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";

export type ClusterNodeData = {
  clusterId: number;
  label: string;
  paperCount: number;
  trending: boolean;
  themeColor: string;
  layoutW: number;
  layoutH: number;
};

function ClusterGraphNode({ data }: NodeProps<ClusterNodeData>) {
  return (
    <div
      className={`rf-cluster-node ${data.trending ? "rf-cluster-node--trending" : ""}`}
      style={{ borderColor: data.themeColor, minWidth: data.layoutW - 24 }}
      title={`${data.label} — ${data.paperCount} papers. Click to open papers in this theme.`}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <div className="rf-cluster-node__ribbon" style={{ background: data.themeColor }} />
      <div className="rf-cluster-node__badge">{data.trending ? "Trending theme" : "Research theme"}</div>
      <div className="rf-cluster-node__title">{data.label}</div>
      <div className="rf-cluster-node__meta">
        {data.paperCount} papers · click to explore
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
}

export default memo(ClusterGraphNode);
