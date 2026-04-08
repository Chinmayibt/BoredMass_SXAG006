import React, { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";

export type PaperNodeData = {
  label: string;
  fullTitle: string;
  summary: string;
  cluster: number;
  themeColor: string;
  isStar: boolean;
  layoutW: number;
  layoutH: number;
};

function PaperGraphNode({ data, selected }: NodeProps<PaperNodeData>) {
  const w = data.layoutW ?? 200;
  return (
    <div
      className={`rf-paper-node ${selected ? "rf-paper-node--selected" : ""} ${data.isStar ? "rf-paper-node--star" : ""}`}
      style={{ borderColor: data.themeColor, width: w, minHeight: data.layoutH ?? 88 }}
      title={`${data.fullTitle}\n${data.summary}`}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} />
      {data.isStar ? <span className="rf-paper-node__star" title="Key paper (insights or top relevance)">★</span> : null}
      <div className="rf-paper-node__title">{data.label}</div>
      <div className="rf-paper-node__meta">{data.summary}</div>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
}

export default memo(PaperGraphNode);
