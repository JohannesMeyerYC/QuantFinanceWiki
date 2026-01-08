from flask import Flask, jsonify, request, send_from_directory, Response, make_response
from flask_cors import CORS
from flask_compress import Compress
import json
import os
import threading
import logging
from functools import wraps
from datetime import datetime, date
import html
from urllib.parse import urljoin, quote
import re
import unidecode

ENV = os.environ.get('FLASK_ENV', 'production')
IS_DEV = ENV == 'development'

class Config:
    BASE_URL = "http://localhost:5000" if IS_DEV else "https://QuantFinanceWiki.com"
    # Use /tmp for writeable data in production if absolutely necessary, 
    # but for read-only static data, keep it in the app directory.
    DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    INTERACTIONS_FILE = 'blog_interactions.json'

app = Flask(__name__)
Compress(app)

# 1. Permissive CORS for Debugging
CORS(app, resources={r"/*": {"origins": "*"}})

interaction_lock = threading.Lock()
_file_cache = {}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- CORS FORCE HANDLER ---
# This ensures headers are sent even if the server crashes halfway through
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def get_file_path(filename):
    return os.path.join(Config.DATA_DIR, os.path.basename(filename))

def make_slug(text, max_words=10):
    """Generate URL-friendly slug from text."""
    if not text:
        return ""
    text = unidecode.unidecode(text)
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    words = text.split('-')
    words = words[:max_words]
    slug = "-".join(words)
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip('-')
    return slug

def update_resources_with_slugs():
    # SKIP IN PRODUCTION to prevent Read-Only File System Errors
    if not IS_DEV:
        logger.info("Skipping resource slug update in production (Read-Only FS)")
        return

    data_dir = 'data'
    resources_file = os.path.join(data_dir, 'resources.json')
    
    try:
        with open(resources_file, 'r', encoding='utf-8') as f:
            resources = json.load(f)
        
        updated = False
        for resource in resources:
            if 'slug' not in resource or not resource['slug']:
                title = resource.get('title', '')
                if title:
                    base_slug = make_slug(title[:80])
                    if base_slug:
                        resource['slug'] = f"{base_slug}-{resource.get('id')}"
                        updated = True
        
        if updated:
            with open(resources_file, 'w', encoding='utf-8') as f:
                json.dump(resources, f, indent=2)
            print(f"Updated {len(resources)} resources.")
    except Exception as e:
        logger.error(f"Error updating resource slugs: {e}")

def update_firms_with_slugs():
    """Generate slugs for firms that don't have them"""
    if not IS_DEV:
        logger.info("Skipping firm slug update in production (Read-Only FS)")
        return

    data_dir = 'data'
    firms_file = os.path.join(data_dir, 'firms.json')
    
    try:
        with open(firms_file, 'r', encoding='utf-8') as f:
            firms = json.load(f)
        
        updated = False
        seen_slugs = set()
        
        for firm in firms:
            name = firm.get('name', '')
            if name:
                base_slug = make_slug(name[:60])
                
                # Ensure uniqueness
                slug = base_slug
                counter = 1
                while slug in seen_slugs:
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                if firm.get('slug') != slug:
                    firm['slug'] = slug
                    seen_slugs.add(slug)
                    updated = True
        
        if updated:
            with open(firms_file, 'w', encoding='utf-8') as f:
                json.dump(firms, f, indent=2)
            print(f"Updated {len(firms)} firms with slugs")
    except Exception as e:
        logger.error(f"Error updating firm slugs: {e}")

def update_early_career_with_slugs():
    """Generate slugs for early career opportunities"""
    if not IS_DEV:
        logger.info("Skipping early career slug update in production (Read-Only FS)")
        return

    data_dir = 'data'
    early_career_file = os.path.join(data_dir, 'early_career.json')
    
    try:
        with open(early_career_file, 'r', encoding='utf-8') as f:
            early_career = json.load(f)
        
        updated = False
        seen_slugs = set()
        
        for opportunity in early_career:
            name = opportunity.get('name', '')
            if name:
                base_slug = make_slug(name[:60])
                
                # Ensure uniqueness
                slug = base_slug
                counter = 1
                while slug in seen_slugs:
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                if opportunity.get('slug') != slug:
                    opportunity['slug'] = slug
                    seen_slugs.add(slug)
                    updated = True
        
        if updated:
            with open(early_career_file, 'w', encoding='utf-8') as f:
                json.dump(early_career, f, indent=2)
            print(f"Updated {len(early_career)} early career opportunities with slugs")
    except Exception as e:
        logger.error(f"Error updating early career slugs: {e}")

def generate_question_slug(question):
    """Generate slug from first 5 words of question and firm name."""
    question_text = question.get('question', '')
    firm = question.get('firm', '').strip()
    
    # Extract first 5 words
    words = question_text.split()[:5]
    first_five = ' '.join(words)
    
    # Generate base slug from first 5 words
    base_slug = make_slug(first_five)
    
    # Add firm slug
    if firm:
        firm_slug = make_slug(firm[:30])  # Limit firm slug length
        slug = f"{base_slug}-{firm_slug}"
    else:
        slug = base_slug
    
    # Ensure slug isn't too long
    if len(slug) > 100:
        slug = slug[:100]
    
    return slug

# Update the existing update_questions_with_improved_slugs function:
def update_questions_with_improved_slugs():
    """Generate slugs from first 5 words of question and firm."""
    if not IS_DEV:
        logger.info("Skipping question slug update in production (Read-Only FS)")
        return

    data_dir = 'data'
    questions_file = os.path.join(data_dir, 'interview_questions.json')
    
    try:
        with open(questions_file, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        updated = False
        seen_slugs = set()
        
        for question in questions:
            old_slug = question.get('slug')
            new_slug = generate_question_slug(question)
            
            # Ensure uniqueness
            slug = new_slug
            counter = 1
            while slug in seen_slugs:
                slug = f"{new_slug}-{counter}"
                counter += 1
            
            # Only update if slug has changed
            if slug != old_slug:
                question['slug'] = slug
                seen_slugs.add(slug)
                updated = True
                logger.info(f"Generated slug: {slug} for question {question.get('id')}")
        
        if updated:
            with open(questions_file, 'w', encoding='utf-8') as f:
                json.dump(questions, f, indent=2)
            print(f"Updated {len(questions)} questions with descriptive slugs")
    except Exception as e:
        logger.error(f"Error updating question slugs: {e}")

def load_json_safe(filename, default=None):
    if default is None:
        default = []
    
    filepath = get_file_path(filename)
    if not os.path.exists(filepath):
        logger.warning(f"File not found: {filename}")
        return default
        
    try:
        stat = os.stat(filepath)
        mtime = stat.st_mtime
        
        if filename in _file_cache:
            cache_mtime, cache_data = _file_cache[filename]
            if cache_mtime == mtime:
                return cache_data

        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            _file_cache[filename] = (mtime, data)
            return data
    except Exception as e:
        logger.error(f"Error reading {filename}: {e}")
        return default

def save_json_safe(filename, data):
    # WARNING: This will fail in standard Cloud Run for persistent data
    # unless you mount a volume. For now, we catch the error.
    filepath = get_file_path(filename)
    tmp_path = filepath + '.tmp'
    try:
        with open(tmp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        os.replace(tmp_path, filepath)
        
        stat = os.stat(filepath)
        _file_cache[filename] = (stat.st_mtime, data)
    except OSError as e:
        if "Read-only file system" in str(e):
            logger.error(f"Cannot save {filename}: File system is read-only (Cloud Run)")
            # In production, we just fail gracefully or use an external DB
            return 
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
    MAX_URLS = 50000
    MAX_BYTES = 49 * 1024 * 1024
    
    SERVER_START_TIME = datetime.utcnow().date().isoformat()
    base_url = Config.BASE_URL.replace("http://", "https://").rstrip('/')
    
    xml_header = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    current_byte_count = sum(len(x.encode('utf-8')) for x in xml_header)
    url_count = 0
    seen_urls = set()
    xml_body = []
    
    def add_entry(path_suffix, lastmod=None, priority='0.5', changefreq='monthly'):
        nonlocal url_count, current_byte_count
        
        if url_count >= MAX_URLS: return
        if current_byte_count >= MAX_BYTES: return

        clean_path = '/' + path_suffix.lstrip('/')
        safe_path = quote(clean_path, safe='/')
        full_url = f"{base_url}{safe_path}"

        if full_url in seen_urls: return
        seen_urls.add(full_url)

        final_date = SERVER_START_TIME 
        if lastmod:
            try:
                if isinstance(lastmod, str):
                    # Try multiple date formats
                    try:
                        parsed_date = datetime.fromisoformat(lastmod.replace('Z', '+00:00')).date()
                    except ValueError:
                        try:
                            # Try common date string formats
                            for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y']:
                                try:
                                    parsed_date = datetime.strptime(lastmod.split('T')[0], fmt).date()
                                    break
                                except ValueError:
                                    continue
                            else:
                                parsed_date = datetime.utcnow().date()
                        except Exception:
                            parsed_date = datetime.utcnow().date()
                elif isinstance(lastmod, (datetime, date)):
                    parsed_date = lastmod if isinstance(lastmod, date) else lastmod.date()
                else:
                    parsed_date = datetime.utcnow().date()
                
                today = datetime.utcnow().date()
                if parsed_date > today:
                    parsed_date = today
                
                final_date = parsed_date.isoformat()
            except Exception:
                # If any date parsing fails, use server start time
                final_date = SERVER_START_TIME

        loc_xml = html.escape(full_url)
        entry = (
            f"  <url>\n"
            f"    <loc>{loc_xml}</loc>\n"
            f"    <lastmod>{final_date}</lastmod>\n"
            f"    <changefreq>{html.escape(str(changefreq))}</changefreq>\n"
            f"    <priority>{html.escape(str(priority))}</priority>\n"
            f"  </url>"
        )
        
        entry_bytes = len(entry.encode('utf-8'))
        if current_byte_count + entry_bytes > MAX_BYTES:
            logger.warning("Sitemap size limit approaching. Truncating.")
            return

        xml_body.append(entry)
        current_byte_count += entry_bytes
        url_count += 1

    # Static pages
    statics = [
        ('/', '1.0', 'daily'),
        ('/roadmaps', '0.9', 'weekly'),
        ('/blog', '0.9', 'daily'),
        ('/firms', '0.8', 'weekly'),
        ('/resources', '0.7', 'monthly'),
        ('/faq', '0.5', 'monthly'),
        ('/interview-questions', '0.9', 'weekly')
    ]
    for path, prio, freq in statics:
        add_entry(path, lastmod=SERVER_START_TIME, priority=prio, changefreq=freq)

    # Blog posts
    posts = load_json_safe('blog.json')
    if isinstance(posts, list):
        for post in posts:
            if post.get('id'):
                add_entry(
                    f"/blog/{post['id']}", 
                    lastmod=post.get('date'), 
                    priority='0.5', 
                    changefreq='monthly'
                )

    # Roadmaps
    roadmaps = load_json_safe('roadmaps.json')
    r_list = list(roadmaps.values()) if isinstance(roadmaps, dict) else roadmaps
    if isinstance(r_list, list):
        for r in r_list:
            if r.get('id'):
                add_entry(
                    f"/roadmaps/{r['id']}", 
                    lastmod=r.get('updated_at') or r.get('date') or SERVER_START_TIME,
                    priority='0.7', 
                    changefreq='weekly'
                )

    # Firms
    firms = load_json_safe('firms.json')
    f_list = list(firms.values()) if isinstance(firms, dict) else firms
    if isinstance(f_list, list):
        for f in f_list:
            if f.get('id'):
                add_entry(
                    f"/firms/{f['id']}", 
                    lastmod=f.get('updated_at') or SERVER_START_TIME,
                    priority='0.5', 
                    changefreq='monthly'
                )
    
    # Interview Questions - individual questions with slugs
    questions = load_json_safe('interview_questions.json')
    if isinstance(questions, list):
        # Add ALL questions to sitemap
        for question in questions:
            if question.get('slug'):
                # Generate full URL
                slug = question.get('slug')
                if not slug:
                    # Generate slug if missing
                    slug = generate_question_slug(question)
                    question['slug'] = slug
                
                add_entry(
                    f"/interview-questions/{slug}", 
                    lastmod=SERVER_START_TIME,
                    priority='0.6', 
                    changefreq='monthly'
                )
        
    # Also add paginated views for better crawling
    total_questions = len(questions)
    questions_per_page = 15
    total_pages = (total_questions + questions_per_page - 1) // questions_per_page
    
    for page in range(1, total_pages + 1):
        add_entry(
            f"/interview-questions?page={page}",
            lastmod=SERVER_START_TIME,
            priority='0.7',
            changefreq='weekly'
        )
    
    # Resources - ALL resources including PDFs
    resources = load_json_safe('resources.json')
    if isinstance(resources, list):
        for resource in resources:
            slug = resource.get('slug')
            if not slug:
                # Generate slug from title if not present
                title = resource.get('title', '')
                if title:
                    slug = make_slug(title[:80])
                if not slug and resource.get('id'):
                    slug = f"resource-{resource.get('id')}"
                if not slug:
                    continue  # Skip if we can't create a slug
            
            # Determine if it's a PDF resource
            is_pdf = False
            resource_type = str(resource.get('type', '')).lower()
            filename = str(resource.get('filename', '')).lower()
            
            if 'pdf' in resource_type or filename.endswith('.pdf'):
                is_pdf = True
            # Also check link for PDF
            elif 'link' in resource:
                link = str(resource.get('link', '')).lower()
                if '.pdf' in link or 'pdf' in link:
                    is_pdf = True
            
            # Set priority: low for PDFs (0.3), medium for others (0.6)
            priority = '0.0' if is_pdf else '0.6'
            
            # Get the best available date
            resource_date = None
            for date_field in ['date', 'updated_at', 'created_at', 'published_date']:
                if resource.get(date_field):
                    resource_date = resource.get(date_field)
                    break
            
            add_entry(
                f"/resources/{slug}", 
                lastmod=resource_date or SERVER_START_TIME,
                priority=priority, 
                changefreq='monthly'
            )
    
    # Add early career pages if they exist
    early_career = load_json_safe('early_career.json')
    if isinstance(early_career, list):
        for item in early_career:
            if item.get('id'):
                add_entry(
                    f"/early-career/{item['id']}",
                    lastmod=SERVER_START_TIME,
                    priority='0.7',
                    changefreq='monthly'
                )
    
    # FAQ entries if they have individual pages
    faq = load_json_safe('faq.json')
    if isinstance(faq, list):
        for faq_item in faq:
            if faq_item.get('id'):
                # Check if FAQ has a slug or can have individual page
                slug = faq_item.get('slug')
                if slug:
                    add_entry(
                        f"/faq/{slug}",
                        lastmod=SERVER_START_TIME,
                        priority='0.4',
                        changefreq='yearly'
                    )

    full_content = "\n".join(xml_header + xml_body + ['</urlset>'])
    resp = Response(full_content, mimetype="application/xml")
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    resp.headers['X-Robots-Tag'] = 'noarchive'
    return resp

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
    resp = make_response(jsonify(data))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/roadmaps/<roadmap_id>', methods=['GET'])
@handle_errors
def get_roadmap(roadmap_id):
    data = load_json_safe('roadmaps.json')
    data_list = list(data.values()) if isinstance(data, dict) else data
    item = next((r for r in data_list if str(r.get('id')) == str(roadmap_id)), None)
    if item:
        resp = make_response(jsonify(item))
        resp.headers['Cache-Control'] = 'public, max-age=3600'
        return resp
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

@app.route('/api/blog/<identifier>', methods=['GET'])
@handle_errors
def get_blog_post(identifier):
    posts = load_json_safe('blog.json')
    
    post = next(
        (p for p in posts if str(p.get('id')) == str(identifier) or p.get('slug') == identifier),
        None
    )
    
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    interactions = load_json_safe(Config.INTERACTIONS_FILE, default={})
    post['likes'] = interactions.get(str(post['id']), {}).get('likes', 0)

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

@app.route('/api/interview-questions', methods=['GET'])
@handle_errors
def get_interview_questions():
    data = load_json_safe('interview_questions.json')
    resp = make_response(jsonify(data))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/interview-questions/<identifier>', methods=['GET'])
@handle_errors
def get_interview_question(identifier):
    data = load_json_safe('interview_questions.json')
    
    # Try to find by slug first
    question = next((q for q in data if q.get('slug') == identifier), None)
    
    # If not found by slug, try by ID
    if not question:
        question = next((q for q in data if str(q.get('id')) == str(identifier)), None)
    
    if question:
        resp = make_response(jsonify(question))
        resp.headers['Cache-Control'] = 'public, max-age=3600'
        return resp
    return jsonify({'error': 'Question not found'}), 404

@app.route('/')
def index():
    return {"status": "online", "message": "QFW Backend is running", "env": ENV}, 200

@app.route('/api/resources/<resource_id>', methods=['GET'])
@handle_errors
def get_resource(resource_id):
    resources = load_json_safe('resources.json')
    
    # Try to find by id first
    resource = next((r for r in resources if str(r.get('id')) == str(resource_id)), None)
    
    # If not found by id, try by slug
    if not resource:
        resource = next((r for r in resources if r.get('slug') == resource_id), None)
    
    if resource:
        resp = make_response(jsonify(resource))
        resp.headers['Cache-Control'] = 'public, max-age=3600'
        return resp
    return jsonify({'error': 'Resource not found'}), 404

@app.route('/api/resources/slug/<slug>', methods=['GET'])
@handle_errors
def get_resource_by_slug(slug):
    resources = load_json_safe('resources.json')
    
    # 1. Try to find by exact slug match
    resource = next((r for r in resources if r.get('slug') == slug), None)
    
    # 2. Fallback: If not found, check if 'slug' param is actually an ID
    if not resource:
        resource = next((r for r in resources if str(r.get('id')) == str(slug)), None)

    if resource:
        resp = make_response(jsonify(resource))
        resp.headers['Cache-Control'] = 'public, max-age=3600'
        return resp
        
    return jsonify({'error': 'Resource not found'}), 404

@app.route('/api/resources/download/<filename>')
@handle_errors
def download_resource(filename):
    """Serve PDF files for download."""
    # Security: ensure filename is safe
    safe_filename = os.path.basename(filename)
    
    # Check if file exists in data directory
    file_path = os.path.join(Config.DATA_DIR, safe_filename)
    
    if not os.path.exists(file_path):
        # Check in a resources subdirectory if exists
        resources_dir = os.path.join(Config.DATA_DIR, 'resources')
        if os.path.exists(resources_dir):
            file_path = os.path.join(resources_dir, safe_filename)
            if not os.path.exists(file_path):
                return jsonify({'error': 'File not found'}), 404
        else:
            return jsonify({'error': 'File not found'}), 404
    
    # Send file with appropriate headers
    return send_from_directory(
        os.path.dirname(file_path),
        os.path.basename(file_path),
        as_attachment=True,
        mimetype='application/pdf'
    )

@app.route('/api/firms/slug/<slug>', methods=['GET'])
@handle_errors
def get_firm_by_slug(slug):
    firms = load_json_safe('firms.json')
    firm = next((f for f in firms if f.get('slug') == slug), None)
    
    if not firm:
        # Fallback: try by ID
        firm = next((f for f in firms if str(f.get('id')) == str(slug)), None)
    
    if firm:
        resp = make_response(jsonify(firm))
        resp.headers['Cache-Control'] = 'public, max-age=3600'
        return resp
    return jsonify({'error': 'Firm not found'}), 404

@app.route('/api/early-career/slug/<slug>', methods=['GET'])
@handle_errors
def get_early_career_by_slug(slug):
    opportunities = load_json_safe('early_career.json')
    opportunity = next((o for o in opportunities if o.get('slug') == slug), None)
    
    if not opportunity:
        # Fallback: try by ID
        opportunity = next((o for o in opportunities if str(o.get('id')) == str(slug)), None)
    
    if opportunity:
        resp = make_response(jsonify(opportunity))
        resp.headers['Cache-Control'] = 'public, max-age=3600'
        return resp
    return jsonify({'error': 'Opportunity not found'}), 404

@app.route('/api/firms/<firm_id>', methods=['GET'])
@handle_errors
def get_firm(firm_id):
    firms = load_json_safe('firms.json')
    firm = next((f for f in firms if str(f.get('id')) == str(firm_id)), None)
    
    if not firm:
        firm = next((f for f in firms if f.get('slug') == firm_id), None)
    
    if firm:
        resp = make_response(jsonify(firm))
        resp.headers['Cache-Control'] = 'public, max-age=3600'
        return resp
    return jsonify({'error': 'Firm not found'}), 404

@app.route('/api/early-career/<opportunity_id>', methods=['GET'])
@handle_errors
def get_early_career_opportunity(opportunity_id):
    opportunities = load_json_safe('early_career.json')
    opportunity = next((o for o in opportunities if str(o.get('id')) == str(opportunity_id)), None)
    
    if not opportunity:
        opportunity = next((o for o in opportunities if o.get('slug') == opportunity_id), None)
    
    if opportunity:
        resp = make_response(jsonify(opportunity))
        resp.headers['Cache-Control'] = 'public, max-age=3600'
        return resp
    return jsonify({'error': 'Opportunity not found'}), 404

@app.route('/api/interview-questions/search', methods=['GET'])
@handle_errors
def search_interview_questions():
    """Search questions with advanced filtering"""
    try:
        questions = load_json_safe('interview_questions.json')
        
        # Get query parameters
        search_term = request.args.get('q', '').lower().strip()
        category = request.args.get('category', '').lower().strip()
        difficulty = request.args.get('difficulty', '').lower().strip()
        limit = int(request.args.get('limit', 20))
        
        filtered_questions = []
        
        for question in questions:
            # Filter by category
            if category and question.get('category', '').lower() != category:
                continue
            
            # Filter by difficulty
            if difficulty and question.get('difficulty', '').lower() != difficulty:
                continue
            
            # Filter by search term
            if search_term:
                search_fields = [
                    question.get('question', ''),
                    question.get('approach', ''),
                    question.get('answer', ''),
                    ' '.join(question.get('tags', [])),
                    ' '.join(question.get('key_concepts', [])),
                    question.get('firm', '')
                ]
                
                search_text = ' '.join(str(field) for field in search_fields).lower()
                if search_term not in search_text:
                    continue
            
            filtered_questions.append(question)
        
        # Sort by relevance (simple implementation)
        if search_term:
            def relevance_score(q):
                score = 0
                if search_term in q.get('question', '').lower():
                    score += 3
                if search_term in q.get('answer', '').lower():
                    score += 2
                if search_term in ' '.join(q.get('tags', [])).lower():
                    score += 1
                return score
            
            filtered_questions.sort(key=relevance_score, reverse=True)
        
        # Limit results
        limited_results = filtered_questions[:limit]
        
        return jsonify({
            'count': len(filtered_questions),
            'results': limited_results,
            'total': len(questions)
        })
        
    except Exception as e:
        logger.error(f"Error searching questions: {e}")
        return jsonify({'error': 'Search failed', 'details': str(e)}), 500
    
@app.route('/api/interview-questions/random', methods=['GET'])
@handle_errors
def get_random_questions():
    """Get fully random questions (not just same topic)."""
    count = request.args.get('count', default=4, type=int)
    data = load_json_safe('interview_questions.json')
    
    # Shuffle all questions
    import random
    random.shuffle(data)
    
    # Return requested number
    random_questions = data[:count]
    
    # Format response to match what frontend expects
    for q in random_questions:
        # Ensure slug exists
        if 'slug' not in q or not q['slug']:
            q['slug'] = generate_question_slug(q)
    
    resp = make_response(jsonify(random_questions))
    resp.headers['Cache-Control'] = 'public, max-age=300'  # Cache for 5 minutes
    return resp

@app.route('/api/interview-questions/random/<current_slug>', methods=['GET'])
@handle_errors
def get_random_questions_excluding_current(current_slug):
    """Get random questions excluding the current one."""
    count = request.args.get('count', default=4, type=int)
    data = load_json_safe('interview_questions.json')
    
    # Filter out current question
    filtered = [q for q in data if q.get('slug') != current_slug]
    
    # Shuffle remaining questions
    import random
    random.shuffle(filtered)
    
    # Return requested number
    random_questions = filtered[:count]
    
    resp = make_response(jsonify(random_questions))
    resp.headers['Cache-Control'] = 'public, max-age=300'
    return resp

if __name__ == '__main__':
    # Only try to write updates in DEV mode
    if IS_DEV:
        if not os.path.exists(Config.DATA_DIR):
            os.makedirs(Config.DATA_DIR)
            print(f"Created data directory at {Config.DATA_DIR}")
        
        # We can safely run these in Dev
        with app.app_context():
            update_questions_with_improved_slugs()
            update_resources_with_slugs()
            update_firms_with_slugs()
            update_early_career_with_slugs()
            generate_question_slug()

    port = int(os.environ.get("PORT", 5000))
    
    if IS_DEV:
        print(f"Starting in DEVELOPMENT mode on http://localhost:{port}")
        app.run(host="0.0.0.0", port=port, debug=True)
    else:
        print(f"Starting in PRODUCTION mode (Manual Run) on port {port}")
        app.run(host="0.0.0.0", port=port, debug=False)