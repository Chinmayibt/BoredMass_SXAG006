from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from app.pipeline.nodes.asset_store_node import asset_store_node
from app.pipeline.nodes.graph_builder_node import graph_builder_node
from app.pipeline.nodes.insight_node import insight_node
from app.pipeline.nodes.memory_node import memory_node
from app.pipeline.nodes.pdf_extract_node import pdf_extract_node
from app.pipeline.nodes.planner_node import planner_node
from app.pipeline.nodes.report_node import report_node
from app.pipeline.nodes.search_node import search_node
from app.pipeline.nodes.structuring_node import structuring_node
from app.pipeline.state import PipelineStateDict


def build_pipeline_graph():
    graph = StateGraph(PipelineStateDict)
    graph.add_node("planner", planner_node)
    graph.add_node("search", search_node)
    graph.add_node("pdf_extract", pdf_extract_node)
    graph.add_node("asset_store", asset_store_node)
    graph.add_node("structuring", structuring_node)
    graph.add_node("memory", memory_node)
    graph.add_node("graph_builder", graph_builder_node)
    graph.add_node("insight", insight_node)
    graph.add_node("report", report_node)

    graph.add_edge(START, "planner")
    graph.add_edge("planner", "search")
    graph.add_edge("search", "pdf_extract")
    graph.add_edge("pdf_extract", "asset_store")
    graph.add_edge("asset_store", "structuring")
    graph.add_edge("structuring", "memory")
    graph.add_edge("memory", "graph_builder")
    graph.add_edge("graph_builder", "insight")
    graph.add_edge("insight", "report")
    graph.add_edge("report", END)
    return graph.compile()
