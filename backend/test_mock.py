import sys
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
sys.path.append("C:/Users/Zuraiz Malik/Desktop/AI Resume Builder/backend")

from ai.services.interview_prep import generate_interview_questions

if __name__ == "__main__":
    try:
        res = generate_interview_questions("Mock Resume", "Mock Job")
        print(res.model_dump())
    except Exception as e:
        print("ERROR:", e)
