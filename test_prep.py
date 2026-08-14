import requests
from unittest.mock import patch


@patch("requests.post")
def test_prep(mock_post):
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {
        "access": "mock-token"
    }

    token_response = requests.post(
        "http://localhost:8000/api/v1/auth/token/",
        json={
            "username": "testuser",
            "password": "testpassword123"
        }
    )

    assert token_response.status_code == 200

    token = token_response.json()["access"]
    assert token == "mock-token"

    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {
        "result": "ok"
    }

    response = requests.post(
        "http://localhost:8000/api/v1/ai/interview-prep/",
        json={
            "custom_resume_text": "Test resume",
            "job_description_text": "Software Engineer"
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200
    assert response.json()["result"] == "ok"