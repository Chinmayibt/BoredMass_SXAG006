from fastapi.testclient import TestClient

from app.main import app


def test_create_job_returns_job_id(monkeypatch):
    client = TestClient(app)

    class StubResp:
        job_id = "job-123"
        status = "queued"

    from app.api.routes import research_v2

    monkeypatch.setattr(research_v2.executor, "create_job", lambda payload: StubResp())
    response = client.post("/v2/research/jobs", json={"topic": "test topic", "max_papers": 20, "max_iterations": 2})
    assert response.status_code == 200
    body = response.json()
    assert body["job_id"] == "job-123"
    assert body["status"] == "queued"
