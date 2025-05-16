import os
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm = ChatOpenAI(
    openai_api_key=GROQ_API_KEY,
    openai_api_base="https://api.groq.com/openai/v1",
    model="llama3-8b-8192"
)

def generate_study_plan(prompt: str) -> str:
    structured_prompt = f"""
    You are an AI assistant that creates structured study plans using any of the major study techniques that
    are recognized such as Pomodoro, spaced repetition, Feynman technique etc.

    User's Study Goals or follow-up question: {prompt}
    
    Format:
    Study Plan:
    - Time Blocks:
    - Breaks:
    - Techniques:
    - Duration:
    """
    response = llm.invoke([HumanMessage(content=structured_prompt)])
    return response.content

def wellness_chatbot_response(user_query: str) -> str:
    structured_prompt = f"""
    You are a supportive wellness chatbot. Provide motivational and wellness-oriented responses.
    Format:
    Response:
    - Mood:
    - Suggestion:
    - Additional Notes:
    
    User Query: {user_query}
    """
    response = llm.invoke([HumanMessage(content=structured_prompt)])
    return response.content
