import React, { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";

const palette = ["#1f77b4", "#2ca02c", "#ff7f0e", "#9467bd", "#17becf", "#d62728"];

export type PaperNodeData = {
  label: string;
  fullTitle: string;
  summary: string;
  cluster: number;
};

function PaperGraphNode({ data, selected }: NodeProps<PaperNodeData>) {
  const color = palette[data.cluster % palette.length];
  return (
    <div
      className={`rf-paper-node ${selected ? "rf-paper-node--selected" : ""}`}
      style={{ borderColor: color }}
      title={`${data.fullTitle}\n${data.summary}`}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <div className="rf-paper-node__title">{data.label}</div>
      <div className="rf-paper-node__meta">{data.summary}</div>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
}

export default memo(PaperGraphNode);
