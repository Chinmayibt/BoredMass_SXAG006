from app.pipeline.graph import build_pipeline_graph


def test_graph_compiles():
    graph = build_pipeline_graph()
    assert graph is not None
