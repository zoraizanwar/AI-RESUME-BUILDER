from pydantic import BaseModel, Field
from typing import List, Optional, get_origin, get_args

class InterviewQuestion(BaseModel):
    question: str = Field(..., description="The interview question")
    why_asked: str = Field(..., description="Why the interviewer might ask this question")
    focus_area: str = Field(..., description="What the candidate should focus on in their answer")
    answer_guidance: Optional[str] = Field(None, description="Optional guidance or framework (e.g. STAR method) for answering")

class InterviewPrepOutput(BaseModel):
    hr_questions: List[InterviewQuestion] = Field(..., description="General HR and screening questions")
    behavioral_questions: List[InterviewQuestion] = Field(..., description="Behavioral questions (teamwork, conflict, etc.)")
    technical_questions: List[InterviewQuestion] = Field(..., description="Technical questions based on skills in the resume")
    project_questions: List[InterviewQuestion] = Field(..., description="Questions specifically about projects listed in the resume")
    experience_questions: List[InterviewQuestion] = Field(..., description="Questions about past work experience and roles")

class MockAIProvider:
    def generate_structured_json(self, prompt: str, schema: BaseModel, system_prompt: str = None) -> BaseModel:
        def _generate_mock_value(field_type, field_name):
            origin = get_origin(field_type)
            
            if origin is list or origin is List:
                args = get_args(field_type)
                item_type = args[0] if args else str
                return [_generate_mock_value(item_type, field_name)] * 2
                
            from typing import Union
            if origin is Union:
                args = get_args(field_type)
                return _generate_mock_value(args[0], field_name)
                
            if origin is dict or field_type is dict:
                return {"mock_key": "mock_value"}
                
            if isinstance(field_type, type) and issubclass(field_type, BaseModel):
                return self.generate_structured_json(prompt, field_type, system_prompt).model_dump()
                
            if field_type is int:
                return 85
                
            if field_type is float:
                return 85.5
                
            if field_type is bool:
                return True
                
            return f"Mock {field_name.replace('_', ' ').title()}"
            
        mock_data = {}
        for field_name, field_info in schema.model_fields.items():
            mock_data[field_name] = _generate_mock_value(field_info.annotation, field_name)
            
        return schema(**mock_data)

provider = MockAIProvider()
try:
    res = provider.generate_structured_json("prompt", InterviewPrepOutput)
    print("SUCCESS")
    print(res.model_dump())
except Exception as e:
    import traceback
    traceback.print_exc()
