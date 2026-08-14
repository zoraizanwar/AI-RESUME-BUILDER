import urllib.request
import json

if __name__ == "__main__":
    url = "http://localhost:8000/api/v1/ai/interview-prep/"
    data = json.dumps({
        "custom_resume_text": '{"personalInfo": {"firstName": "John"}}',
        "job_description_text": "Software Engineer"
    }).encode('utf-8')

    # First get token
    login_url = "http://localhost:8000/api/v1/auth/login/"
    login_data = json.dumps({"email": "test@example.com", "password": "testpassword123"}).encode('utf-8')
    try:
        req = urllib.request.Request(login_url, data=login_data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            token = json.loads(response.read())['access']

        req = urllib.request.Request(url, data=data, headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        })
        with urllib.request.urlopen(req) as response:
            print(response.status)
            print(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()}")
    except Exception as e:
        print("Error:", e)
