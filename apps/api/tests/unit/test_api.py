"""Unit tests for apps/api control plane."""

import pytest
from arena_api.main import create_app
from fastapi.testclient import TestClient


@pytest.fixture
def client() -> TestClient:
    app = create_app()
    return TestClient(app)


def test_healthz(client: TestClient) -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
    assert "X-Correlation-ID" in response.headers


def test_readyz(client: TestClient) -> None:
    response = client.get("/readyz")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


def test_project_and_spec_lifecycle(client: TestClient) -> None:
    # 1. Create project
    res_proj = client.post("/v1/projects", json={"name": "Doc Review Project"})
    assert res_proj.status_code == 201
    proj_data = res_proj.json()
    proj_id = proj_data["id"]
    assert proj_id.startswith("prj_")

    # 2. List projects
    res_list = client.get("/v1/projects")
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1

    # 3. Create spec
    task_payload = {"objective": "Analyze documents", "frameworks": ["langgraph"]}
    res_spec = client.post(f"/v1/projects/{proj_id}/specs", json={"task_data": task_payload})
    assert res_spec.status_code == 201
    spec_data = res_spec.json()
    spec_id = spec_data["id"]
    spec_hash = spec_data["spec_hash"]
    assert spec_data["status"] == "draft"

    # 4. Approve spec with invalid hash -> error body 400
    res_bad_approve = client.post(f"/v1/specs/{spec_id}/approve", params={"expected_hash": "wrong_hash"})
    assert res_bad_approve.status_code == 400
    err_body = res_bad_approve.json()
    assert err_body["code"] == "SPEC_HASH_MISMATCH"
    assert "correlation_id" in err_body
    assert err_body["retryable"] is False

    # 5. Approve spec with correct hash -> success
    res_ok_approve = client.post(f"/v1/specs/{spec_id}/approve", params={"expected_hash": spec_hash})
    assert res_ok_approve.status_code == 200
    assert res_ok_approve.json()["status"] == "approved"
    assert res_ok_approve.json()["approved_at"] is not None


def test_resource_not_found_error_body(client: TestClient) -> None:
    response = client.post("/v1/projects/prj_nonexistent/specs", json={"task_data": {}})
    assert response.status_code == 404
    err_body = response.json()
    assert err_body["code"] == "RESOURCE_NOT_FOUND"
    assert "correlation_id" in err_body
