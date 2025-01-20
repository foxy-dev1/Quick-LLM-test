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

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json

        if not all(key in data for key in ['prompt', 'question', 'model', 'temperature', 'api_key']):
            return jsonify({"error": "Missing required fields in request"}), 400


        prompt = data['prompt']
        question = data['question']
        model = data['model']
        temperature = data['temperature']
        api_key = data['api_key']


        prompt_template = ChatPromptTemplate.from_messages([
            ("system", prompt),
            ("user", f"Question: {question}")
        ])
        
        # Initialize the LLM with the provided API key
        llm = ChatGoogleGenerativeAI(
            model=model,
            temperature=temperature,
            google_api_key=api_key,  # Use the API key from the request
            max_retries=2,
        )
        
        # Set up the output parser and chain
        output_parser = StrOutputParser()
        chain = prompt_template | llm | output_parser
        
        # Invoke the chain and get the response
        response = chain.invoke({"question": question})
        return jsonify({"response": response})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)