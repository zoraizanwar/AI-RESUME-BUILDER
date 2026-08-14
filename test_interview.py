import os
import sys

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

from ai.services.interview_prep import generate_interview_questions

if __name__ == "__main__":
    try:
        print("Testing generate_interview_questions...")
        result = generate_interview_questions("This is a mock resume", "This is a mock job")
        print("SUCCESS!")
        print(result.model_dump())
    except Exception as e:
        import traceback
        print("ERROR OCCURRED:")
        traceback.print_exc()
