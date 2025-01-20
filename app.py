from flask import Flask, request, jsonify
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("No Google API key found. Please set GOOGLE_API_KEY in .env file")

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        prompt = ChatPromptTemplate.from_messages([
            ("system", data['prompt']),
            ("user", f"Question: {data['question']}")
        ])
        
        llm = ChatGoogleGenerativeAI(
            model=data['model'],
            temperature=data['temperature'],
            google_api_key=GOOGLE_API_KEY,
            max_retries=2,
        )
        
        output_parser = StrOutputParser()
        chain = prompt | llm | output_parser
        
        response = chain.invoke({"question": data['question']})
        return jsonify({"response": response})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)