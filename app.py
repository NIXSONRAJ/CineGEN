# ==============================================================================
# CINEGEN OS 1.0.0 | MASTER SERVER
# A Product of Ash Creations Company
# Lead Architect: Director Devil
# ==============================================================================

import os
import re
import requests
import pandas as pd
from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv

# ------------------------------------------------------------------------------
# 🔐 ENVIRONMENT SECRETS & INITIALIZATION
# ------------------------------------------------------------------------------
load_dotenv()
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
TMDB_TOKEN = os.getenv("TMDB_READ_TOKEN")

app = Flask(__name__)

# In-memory database for the Script Studio Work Queue
saved_scenes = []

# ------------------------------------------------------------------------------
# 🌐 PAGE ROUTING (THE FRONT DOOR)
# ------------------------------------------------------------------------------
@app.route('/')
def home():
    """Serves Page 1: The Landing Page"""
    return render_template('index.html')
@app.route('/ash-creations')

def ash_creations():
    """Serves Page 5: The Ash Creations Origin Story"""
    return render_template('ash-creations.html')

@app.route('/gateway.html')
def gateway():
    """Serves Page 2: The Crossroads"""
    return render_template('gateway.html')

@app.route('/workspace.html')
def workspace():
    """Serves Page 3: The Data Command Center"""
    return render_template('workspace.html')

@app.route('/script-studio.html')
def script_studio():
    """Serves Page 4: The Creative Suite"""
    return render_template('script-studio.html')

# ------------------------------------------------------------------------------
# 🧠 NEURAL CONNECTION 1: SCRIPT ANALYST AI
# ------------------------------------------------------------------------------
@app.route('/api/chat/analyst', methods=['POST'])
def chat_analyst():
    """Handles logic and brainstorming for the Script Studio."""
    data = request.json
    user_message = data.get('message', '')

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    system_prompt = """You are the Script Analyst AI for CineGen. You act as an elite Hollywood script doctor.
    CRITICAL RULES:
    1. Analyze the user's scene or story idea for logic, pacing, and emotional impact.
    2. Point out potential plot holes or clichés.
    3. Suggest improvements and reference specific past movies to help them visualize the tone.
    4. Keep responses structured, highly professional, and deeply creative."""

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_KEY}", 
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            },
            timeout=15
        )
        response.raise_for_status()
        ai_reply = response.json()['choices'][0]['message']['content']
        return jsonify({"response": ai_reply})
        
    except requests.exceptions.RequestException as e:
        print(f"Script Analyst API Error: {e}")
        return jsonify({"response": "Neural link disrupted. I am currently unable to access the creative matrix. Please try again later."}), 503

# ------------------------------------------------------------------------------
# 🧞‍♂️ NEURAL CONNECTION 2: CINE GENIE CHATBOT
# ------------------------------------------------------------------------------
@app.route('/api/chat/genie', methods=['POST'])
def chat_genie():
    """Handles movie trivia and recommendations for the Workspace."""
    data = request.json
    user_message = data.get('message', '')

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    system_prompt = """You are Cine Genie, an advanced cinematic AI assistant.
    CRITICAL RULES:
    1. Answer the user's queries about movies, directors, actors, or box office trivia.
    2. Provide excellent movie recommendations based on their requests.
    3. Keep your tone elegant, slightly mysterious, and highly knowledgeable about film history.
    4. Keep your responses concise and formatted for a chat interface."""

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_KEY}", 
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            },
            timeout=15
        )
        response.raise_for_status()
        ai_reply = response.json()['choices'][0]['message']['content']
        return jsonify({"response": ai_reply})
        
    except requests.exceptions.RequestException as e:
        print(f"Genie API Error: {e}")
        return jsonify({"response": "My connection to the cinematic archives is temporarily disrupted."}), 503

# ------------------------------------------------------------------------------
# 🎬 DATA MODULE 1: DEEP LORE MOVIE EXPLORER
# ------------------------------------------------------------------------------
@app.route('/api/explore', methods=['POST'])
def explore_movie():
    """Fetches combined data from TMDB and Wikipedia."""
    data = request.json
    query = data.get('query', '')
    
    if not query:
        return jsonify({"error": "No search query provided."}), 400

    try:
        # 1. TMDB Database Call
        tmdb_url = "https://api.themoviedb.org/3/search/movie"
        headers = {
            "Authorization": f"Bearer {TMDB_TOKEN}",
            "accept": "application/json"
        }
        params = {
            "query": query,
            "include_adult": "false",
            "language": "en-US",
            "page": 1
        }
        
        tmdb_response = requests.get(tmdb_url, headers=headers, params=params, timeout=10).json()

        if not tmdb_response.get('results'):
            return jsonify({"error": f"No cinematic records found for '{query}'."}), 404

        movie = tmdb_response['results'][0]
        title = movie.get('title')
        poster_path = movie.get('poster_path')
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""

        # 2. Wikipedia Lore Call
        wiki_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title.replace(' ', '_')}"
        wiki_headers = {
            "User-Agent": "CineGEN_Enterprise_App/1.0 (Contact: ashcreations@cinegen.com)"
        }
        wiki_response = requests.get(wiki_url, headers=wiki_headers, timeout=5)
        
        if wiki_response.status_code == 200:
            wiki_lore = wiki_response.json().get('extract', 'Extended lore restricted or unavailable.')
        else:
            wiki_lore = "Wikipedia data banks currently inaccessible for this specific title."

        return jsonify({
            "title": title,
            "release_date": movie.get('release_date', 'Unknown'),
            "rating": movie.get('vote_average', 'N/A'),
            "tmdb_plot": movie.get('overview', 'No synopsis available.'),
            "poster": poster_url,
            "wiki_lore": wiki_lore
        })

    except requests.exceptions.RequestException as e:
        print(f"Database Fetch Error: {e}")
        return jsonify({"error": "External database link severed. Please check terminal logs."}), 503

# ------------------------------------------------------------------------------
# 📁 DATA MODULE 2: FILE MANAGER & PANDAS PARSER
# ------------------------------------------------------------------------------
@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Parses uploaded CSV/Excel files and returns an HTML table."""
    if 'dataset' not in request.files:
        return jsonify({"error": "No file detected by the system."}), 400
    
    file = request.files['dataset']
    if file.filename == '':
        return jsonify({"error": "No file selected."}), 400

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            return jsonify({"error": "Unsupported format. Please use CSV or Excel."}), 400
        
        # Converts dataframe to a styled HTML table
        html_table = df.head(100).to_html(classes="data-table", index=False, border=0)
        
        return jsonify({
            "message": f"Successfully parsed {file.filename} ({len(df)} rows total).",
            "table_html": html_table
        })

    except Exception as e:
        print(f"Data Parsing Error: {e}")
        return jsonify({"error": "Failed to parse the data file. The structure may be corrupted."}), 500

# ------------------------------------------------------------------------------
# 💻 DATA MODULE 3: PROGRAMMING IDE (SIMULATION)
# ------------------------------------------------------------------------------
@app.route('/api/execute', methods=['POST'])
def execute_code():
    """Receives code from the IDE and returns simulated terminal output."""
    data = request.json
    language = data.get('language', 'python')
    code = data.get('code', '').strip()
    
    if not code:
        return jsonify({"output": "Error: No code provided. Execution aborted."})

    output = f"> Initializing {language.upper()} environment...\n"
    
    try:
        if language == 'sql':
            if 'SELECT' in code.upper():
                output += "> Query executed successfully. 15 rows returned.\n"
                output += "> [Data Object Reference: Matrix_Table_01]"
            elif 'DROP' in code.upper():
                output += "> WARNING: Destructive command detected. Operation blocked in prototype mode."
            else:
                output += "> Syntax recognized. Server awaiting actual database binding."
                
        elif language == 'python':
            if 'import pandas' in code:
                output += "> Pandas library loaded successfully.\n"
            if 'print' in code:
                match = re.search(r"print\(['\"](.*?)['\"]\)", code)
                if match:
                    output += f"{match.group(1)}\n"
                else:
                    output += "> Object printed to standard output.\n"
            output += "> Python script execution completed."
            
        return jsonify({"output": output})
        
    except Exception as e:
        return jsonify({"output": f"Syntax Error on line 1: {e}"})

# ------------------------------------------------------------------------------
# 📋 CREATIVE MODULE 1: WORK QUEUE MEMORY
# ------------------------------------------------------------------------------
@app.route('/api/scenes', methods=['GET', 'POST'])
def manage_scenes():
    """Handles saving to and loading from the Work Queue."""
    global saved_scenes
    
    if request.method == 'POST':
        scene_data = request.json
        scene_data['id'] = len(saved_scenes) + 1 
        saved_scenes.append(scene_data)
        return jsonify({"message": "Scene secured in the Work Queue.", "scenes": saved_scenes})
        
    return jsonify({"scenes": saved_scenes})

# ------------------------------------------------------------------------------
# 🚀 SERVER IGNITION
# ------------------------------------------------------------------------------
if __name__ == '__main__':
    print("\n" + "="*50)
    print("🎬 CineGEN Master Server initializing...")
    print("🏢 Ash Creations Company | Director Devil")
    
    if OPENROUTER_KEY and TMDB_TOKEN:
        print("✅ Secure API Keys Loaded Successfully.")
    else:
        print("⚠️ Warning: API Keys missing from .env file.")
        
    print("="*50 + "\n")
    
    # Run the server on port 5000
    app.run(debug=True, port=5000)