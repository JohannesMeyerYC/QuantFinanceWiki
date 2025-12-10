from flask import Flask, jsonify, request, send_from_directory, Response, make_response
from flask_cors import CORS
from flask_compress import Compress
import json
import os
import threading
import logging
from functools import wraps
from datetime import datetime

ENV = os.environ.get('FLASK_ENV', 'production')
IS_DEV = ENV == 'development'

class Config:
    BASE_URL = "http://localhost:5000" if IS_DEV else "https://QuantFinanceWiki.com"
    DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    INTERACTIONS_FILE = 'blog_interactions.json'

app = Flask(__name__)
Compress(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

interaction_lock = threading.Lock()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_file_path(filename):
    return os.path.join(Config.DATA_DIR, os.path.basename(filename))

def load_json_safe(filename, default=None):
    if default is None:
        default = []
    
    filepath = get_file_path(filename)
    if not os.path.exists(filepath):
        logger.warning(f"File not found: {filename}")
        return default
        
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading {filename}: {e}")
        return default

def save_json_safe(filename, data):
    filepath = get_file_path(filename)
    tmp_path = filepath + '.tmp'
    try:
        with open(tmp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        os.replace(tmp_path, filepath)
    except Exception as e:
        logger.error(f"Error saving {filename}: {e}")
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise

def handle_errors(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Server Error: {e}", exc_info=True)
            return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
    return decorated_function


@app.route('/robots.txt')
def robots_txt():
    lines = [
        "User-agent: *",
        "Allow: /",
        f"Sitemap: {Config.BASE_URL}/sitemap.xml"
    ]
    return Response("\n".join(lines), mimetype="text/plain")

@app.route('/sitemap.xml')
def sitemap_xml():
    urls = [
        {'loc': f"{Config.BASE_URL}/", 'priority': '1.0'},
        {'loc': f"{Config.BASE_URL}/roadmaps", 'priority': '0.9'},
        {'loc': f"{Config.BASE_URL}/firms", 'priority': '0.8'},
        {'loc': f"{Config.BASE_URL}/blog", 'priority': '0.9'},
        {'loc': f"{Config.BASE_URL}/resources", 'priority': '0.8'},
        {'loc': f"{Config.BASE_URL}/faq", 'priority': '0.6'},
    ]

    posts = load_json_safe('blog.json')
    for post in posts:
        if 'id' in post:
            urls.append({
                'loc': f"{Config.BASE_URL}/blog/{post['id']}",
                'lastmod': post.get('date', datetime.now().strftime('%Y-%m-%d')),
                'priority': '0.8'
            })

    roadmaps = load_json_safe('roadmaps.json')
    r_list = list(roadmaps.values()) if isinstance(roadmaps, dict) else roadmaps
    for r in r_list:
        if 'id' in r:
            urls.append({
                'loc': f"{Config.BASE_URL}/roadmaps/{r['id']}",
                'priority': '0.9'
            })

    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for url in urls:
        xml.append('  <url>')
        xml.append(f"    <loc>{url['loc']}</loc>")
        if 'lastmod' in url:
            xml.append(f"    <lastmod>{url['lastmod']}</lastmod>")
        xml.append(f"    <priority>{url['priority']}</priority>")
        xml.append('  </url>')
    
    xml.append('</urlset>')
    
    return Response("\n".join(xml), mimetype="application/xml")


@app.route('/api/health', methods=['GET'])
@handle_errors
def health_check():
    data_dir_ok = os.path.exists(Config.DATA_DIR)
    return jsonify({
        'status': 'ok' if data_dir_ok else 'error',
        'environment': ENV,
        'data_dir_exists': data_dir_ok,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })
    
@app.route('/api/early-career', methods=['GET'])
@handle_errors
def get_early_career():
    resp = make_response(jsonify(load_json_safe('early_career.json')))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/roadmaps', methods=['GET'])
@handle_errors
def get_roadmaps():
    data = load_json_safe('roadmaps.json')
    if isinstance(data, dict):
        data = list(data.values())
    return jsonify(data)

@app.route('/api/roadmaps/<roadmap_id>', methods=['GET'])
@handle_errors
def get_roadmap(roadmap_id):
    data = load_json_safe('roadmaps.json')
    data_list = list(data.values()) if isinstance(data, dict) else data
    item = next((r for r in data_list if str(r.get('id')) == str(roadmap_id)), None)
    if item:
        return jsonify(item)
    return jsonify({'error': 'Roadmap not found'}), 404

@app.route('/api/firms', methods=['GET'])
@handle_errors
def get_firms():
    resp = make_response(jsonify(load_json_safe('firms.json')))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/faq', methods=['GET'])
@handle_errors
def get_faq():
    resp = make_response(jsonify(load_json_safe('faq.json')))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/resources', methods=['GET'])
@handle_errors
def get_resources():
    resp = make_response(jsonify(load_json_safe('resources.json')))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/blog', methods=['GET'])
@handle_errors
def get_blog_posts():
    posts = load_json_safe('blog.json')
    interactions = load_json_safe(Config.INTERACTIONS_FILE, default={})
    for post in posts:
        pid = str(post.get('id'))
        post['likes'] = interactions.get(pid, {}).get('likes', 0)
    return jsonify(posts)

@app.route('/api/blog/<post_id>', methods=['GET'])
@handle_errors
def get_blog_post(post_id):
    posts = load_json_safe('blog.json')
    post = next((p for p in posts if str(p.get('id')) == str(post_id)), None)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    interactions = load_json_safe(Config.INTERACTIONS_FILE, default={})
    post['likes'] = interactions.get(str(post_id), {}).get('likes', 0)
    return jsonify(post)

@app.route('/api/blog/<post_id>/like', methods=['POST'])
@handle_errors
def like_post(post_id):
    post_id = str(post_id)
    with interaction_lock:
        interactions = load_json_safe(Config.INTERACTIONS_FILE, default={})
        if post_id not in interactions:
            interactions[post_id] = {'likes': 0}
        interactions[post_id]['likes'] += 1
        save_json_safe(Config.INTERACTIONS_FILE, interactions)
        new_count = interactions[post_id]['likes']
    return jsonify({'likes': new_count})

@app.route('/api/blog/<post_id>/unlike', methods=['POST'])
@handle_errors
def unlike_post(post_id):
    post_id = str(post_id)
    with interaction_lock:
        interactions = load_json_safe(Config.INTERACTIONS_FILE, default={})
        current_likes = 0
        if post_id in interactions:
            if interactions[post_id]['likes'] > 0:
                interactions[post_id]['likes'] -= 1
                save_json_safe(Config.INTERACTIONS_FILE, interactions)
            current_likes = interactions[post_id]['likes']
    return jsonify({'likes': current_likes})

@app.route('/')
def index():
    return {"status": "online", "message": "QFW Backend is running", "env": ENV}, 200

# 3. Main execution block (Handles local runs)
if __name__ == '__main__':
    if not os.path.exists(Config.DATA_DIR):
        os.makedirs(Config.DATA_DIR)
        print(f"Created data directory at {Config.DATA_DIR}")

    port = int(os.environ.get("PORT", 5000))
        
    if IS_DEV:
        print(f"Starting in DEVELOPMENT mode on http://localhost:{port}")
        app.run(host="0.0.0.0", port=port, debug=True)
    else:
        print(f"Starting in PRODUCTION mode (Manual Run) on port {port}")
        app.run(host="0.0.0.0", port=port, debug=False)