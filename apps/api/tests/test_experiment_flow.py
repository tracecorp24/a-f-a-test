"""End-to-end API flow: spec -> experiment -> run -> comparison -> ranking -> export."""

import hashlib
import io
import json
import subprocess
import sys
import time
import zipfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from arena_api.main import create_app
from arena_api.runner import DEFAULT_FRAMEWORKS


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("ARENA_STATE_FILE", "")
    with TestClient(create_app()) as c:
        yield c


def _create_experiment(client: TestClient, **task: object) -> str:
    project = client.post("/v1/projects", json={"name": "t"}).json()
    task_data = {"objective": "Sözleşme çelişkileri", "frameworks": DEFAULT_FRAMEWORKS, **task}
    spec = client.post(f"/v1/projects/{project['id']}/specs", json={"task_data": task_data}).json()
    assert client.post(f"/v1/specs/{spec['id']}/approve", params={"expected_hash": spec["spec_hash"]}).status_code == 200
    exp = client.post("/v1/experiments", json={"spec_id": spec["id"]})
    assert exp.status_code == 201
    return exp.json()["id"]


def _wait(client: TestClient, exp_id: str, final: set[str]) -> dict:
    for _ in range(100):
        body = client.get(f"/v1/experiments/{exp_id}").json()
        if body["status"] in final:
            return body
        time.sleep(0.05)
    raise AssertionError(f"timeout, status={body['status']}")


def test_spec_must_be_approved(client: TestClient) -> None:
    project = client.post("/v1/projects", json={"name": "t"}).json()
    spec = client.post(f"/v1/projects/{project['id']}/specs", json={"task_data": {}}).json()
    assert client.post("/v1/experiments", json={"spec_id": spec["id"]}).status_code == 409
    assert client.post(f"/v1/specs/{spec['id']}/approve", params={"expected_hash": "bad"}).status_code == 400


def test_full_flow(client: TestClient) -> None:
    exp_id = _create_experiment(client, repetitions=2, threshold=0.9)
    assert client.post(f"/v1/experiments/{exp_id}/run").status_code == 409  # not built yet
    assert client.post(f"/v1/experiments/{exp_id}/build").status_code == 202
    assert client.post(f"/v1/experiments/{exp_id}/run").status_code == 202
    exp = _wait(client, exp_id, {"completed", "failed", "cancelled"})
    assert exp["status"] == "completed", exp.get("error")
    assert len(exp["candidate_details"]) == 10

    by_fw = {c["framework_id"]: c for c in exp["candidate_details"]}
    for cand in by_fw.values():
        assert cand["status"] == "completed"
        assert cand["evaluation"]["schema_pass"] is True
        assert cand["usage"]["source"] == "provider_reported"
        assert cand["usage"]["total_tokens"] > 0
        assert cand["usage"]["requests"] >= 1
        # exact ledger arithmetic: total is strictly prompt + completion (ADR-0006)
        assert cand["usage"]["total_tokens"] == cand["usage"]["prompt_tokens"] + cand["usage"]["completion_tokens"]
        assert cand["progress"]["repetitions_done"] == 2
        assert set(cand["metrics"]) == {"quality", "speed", "token", "reliability"}
    # With the LLM-driven skeletons every framework's mock audit finds both labeled
    # conflicts, so all of them pass the F1 hard gate (ADR-0007).
    assert by_fw["langgraph"]["evaluation"]["conflict_f1"] == 1.0
    assert by_fw["langgraph"]["evaluation"]["eligible"] is True
    assert by_fw["crewai"]["evaluation"]["eligible"] is True
    assert by_fw["langgraph"]["telemetry"]["agents"]

    events = client.get(f"/v1/experiments/{exp_id}/events").json()
    assert events["events"] and events["last_seq"] >= len(events["events"])
    later = client.get(f"/v1/experiments/{exp_id}/events", params={"after": events["last_seq"]}).json()
    assert later["events"] == []

    comparison = client.get(f"/v1/experiments/{exp_id}/comparison").json()
    assert len(comparison["comparisons"]) == 10

    ranking = client.post(f"/v1/experiments/{exp_id}/rankings", json={}).json()
    assert ranking["status"] == "RECOMMENDED"
    assert not ranking["ineligible"]
    assert ranking["winner"] in {c["framework_id"] for c in ranking["ranked"]}
    strict = client.post(f"/v1/experiments/{exp_id}/rankings", json={"min_quality": 100.1})
    assert strict.status_code == 422
    none_left = client.post(f"/v1/experiments/{exp_id}/rankings", json={"min_quality": 100}).json()
    assert none_left["winner"] is None or none_left["winner"] in DEFAULT_FRAMEWORKS

    assert exp_id in [e["id"] for e in client.get("/v1/experiments").json()]


@pytest.mark.parametrize("fmt", ["zip", "docker", "poetry"])
def test_export_is_standalone_and_runnable(client: TestClient, fmt: str, tmp_path: Path) -> None:
    exp_id = _create_experiment(client, frameworks=["langgraph", "crewai"])
    client.post(f"/v1/experiments/{exp_id}/build")
    client.post(f"/v1/experiments/{exp_id}/run")
    exp = _wait(client, exp_id, {"completed"})
    cand = next(c for c in exp["candidate_details"] if c["framework_id"] == "langgraph")

    record = client.post(f"/v1/candidates/{cand['id']}/exports", params={"format": fmt})
    assert record.status_code == 200
    record = record.json()
    assert record["secrets_found"] == 0 and "main.py" in record["files"]

    download = client.get(f"/v1/exports/{record['id']}/download")
    assert download.status_code == 200
    assert hashlib.sha256(download.content).hexdigest() == record["sha256"] == download.headers["x-content-sha256"]
    with zipfile.ZipFile(io.BytesIO(download.content)) as archive:
        assert set(archive.namelist()) == set(record["files"])
        archive.extractall(tmp_path)
    source = (tmp_path / "main.py").read_text(encoding="utf-8")
    assert "arena_" not in source
    run = subprocess.run([sys.executable, "-I", str(tmp_path / "main.py")], capture_output=True, text=True, encoding="utf-8")
    assert run.returncode == 0, run.stderr
    # Offline shim has no model access: the schema stays valid but conflicts need a provider.
    assert json.loads(run.stdout)["conflict_count"] == 0
    assert client.get("/v1/exports").json()[0]["id"] == record["id"]


def test_pause_resume_cancel(client: TestClient) -> None:
    exp_id = _create_experiment(client, repetitions=10)
    client.post(f"/v1/experiments/{exp_id}/build")
    assert client.post(f"/v1/experiments/{exp_id}/pause").status_code == 409
    client.post(f"/v1/experiments/{exp_id}/run")
    # whichever state we catch it in, the controls must never leave it inconsistent
    status = client.post(f"/v1/experiments/{exp_id}/cancel")
    final = _wait(client, exp_id, {"completed", "cancelled"})
    assert final["status"] in {"completed", "cancelled"}
    if status.status_code == 200:
        assert final["status"] == "cancelled"
    # a finished experiment can be re-run
    assert client.post(f"/v1/experiments/{exp_id}/run").status_code == 202
    assert _wait(client, exp_id, {"completed"})["status"] == "completed"


def test_framework_runtime_and_verify(client: TestClient) -> None:
    runtime = client.get("/v1/frameworks/langgraph/runtime").json()
    assert "run_langgraph_pipeline" in runtime["source"] and runtime["manifest_errors"] == []
    verify = client.post("/v1/frameworks/langgraph/verify").json()
    assert verify["verification_status"] == "verified" and verify["smoke_test"]["passed"]
    assert client.get("/v1/frameworks/nope/runtime").status_code == 404
    assert client.get("/v1/frameworks/..%2f..%2fetc/runtime").status_code == 404
    frameworks = client.get("/v1/frameworks").json()["frameworks"]
    assert len(frameworks) == 10 and all(f["manifest_errors"] == [] for f in frameworks)


def test_unknown_framework_rejected(client: TestClient) -> None:
    exp_id = _create_experiment(client, frameworks=["langgraph", "does-not-exist"])
    assert client.post(f"/v1/experiments/{exp_id}/build").status_code == 400
    assert client.get("/v1/system/status").json()["fixture"]["integrity_verified"] is True
