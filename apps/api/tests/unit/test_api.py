"""Unit and integration tests for apps/api full REST control plane."""

import time

import pytest
from arena_api.main import create_app
from fastapi.testclient import TestClient


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("ARENA_STATE_FILE", "")  # do not persist test data
    with TestClient(create_app()) as test_client:  # keep one event loop for background runs
        yield test_client


def test_frameworks_endpoints(client: TestClient) -> None:
    res = client.get("/v1/frameworks")
    assert res.status_code == 200
    frameworks = res.json().get("frameworks", [])
    assert len(frameworks) == 10

    # Verify existing runtime
    v_res = client.post("/v1/frameworks/langgraph/verify")
    assert v_res.status_code == 200
    assert v_res.json()["verification_status"] == "verified"


def test_full_experiment_to_export_lifecycle(client: TestClient) -> None:
    # 1. Create project
    res_proj = client.post("/v1/projects", json={"name": "End-to-End Test Project"})
    proj_id = res_proj.json()["id"]

    # 2. Create spec
    task_payload = {
        "objective": "Summarize contracts",
        "frameworks": ["langgraph", "google-adk", "crewai"],
    }
    res_spec = client.post(f"/v1/projects/{proj_id}/specs", json={"task_data": task_payload})
    spec_id = res_spec.json()["id"]
    spec_hash = res_spec.json()["spec_hash"]

    # 3. Trying to create experiment with unapproved spec fails (409)
    res_unapproved = client.post("/v1/experiments", json={"spec_id": spec_id})
    assert res_unapproved.status_code == 409

    # 4. Approve spec
    res_app = client.post(f"/v1/specs/{spec_id}/approve", params={"expected_hash": spec_hash})
    assert res_app.status_code == 200

    # 5. Create experiment with approved spec
    res_exp = client.post("/v1/experiments", json={"spec_id": spec_id})
    assert res_exp.status_code == 201
    exp_id = res_exp.json()["id"]

    # 6. Build candidates
    res_build = client.post(f"/v1/experiments/{exp_id}/build")
    assert res_build.status_code == 202
    assert res_build.json()["candidates_count"] == 3

    # 7. Run experiment
    res_run = client.post(f"/v1/experiments/{exp_id}/run")
    assert res_run.status_code == 202
    for _ in range(100):  # the run is asynchronous: wait until it finishes
        if client.get(f"/v1/experiments/{exp_id}").json()["status"] == "completed":
            break
        time.sleep(0.05)
    else:
        pytest.fail("experiment did not complete")

    # 8. Comparison
    res_comp = client.get(f"/v1/experiments/{exp_id}/comparison")
    assert res_comp.status_code == 200
    assert len(res_comp.json()["comparisons"]) == 3

    # 9. Rankings
    res_rank = client.post(
        f"/v1/experiments/{exp_id}/rankings",
        json={"weights": {"quality": 50, "speed": 30, "token": 10, "reliability": 10}},
    )
    assert res_rank.status_code == 200
    rank_data = res_rank.json()
    assert rank_data["status"] == "RECOMMENDED"
    assert rank_data["winner"] is not None

    # 10. Export candidate
    can_id = res_comp.json()["comparisons"][0]["candidate_id"]
    res_export = client.post(f"/v1/candidates/{can_id}/exports")
    assert res_export.status_code == 200
    assert "Dockerfile" in res_export.json()["files"]
    assert "pyproject.toml" in res_export.json()["files"]
