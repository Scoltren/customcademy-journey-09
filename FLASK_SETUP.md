
# Connecting the React Frontend to Flask Backend

This document provides instructions for setting up and connecting your React frontend to your Flask backend.

## Flask Backend Setup

1. Make sure your Flask server is running and properly configured to accept requests from your React frontend.

2. In your Flask app, enable CORS to allow requests from your React frontend:

```python
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Course, Category, Chapter  # Import your models

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure the database connection
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:DTi871LVyuyLUhFr@db.earqddyjwuassqvgogqw.supabase.co:5432/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Sample route for getting all courses
@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    result = []
    for course in courses:
        # Get the category name if available
        category_name = None
        if course.category_id:
            category = Category.query.get(course.category_id)
            if category:
                category_name = category.name
                
        result.append({
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'thumbnail': course.thumbnail,
            'price': float(course.price) if course.price else 0,
            'overall_rating': float(course.overall_rating) if course.overall_rating else 0,
            'difficulty_level': course.difficulty_level,
            'category_id': course.category_id,
            'category_name': category_name,
            'creator_id': course.creator_id,
            'created_at': course.created_at.isoformat() if course.created_at else None
        })
    return jsonify(result)

# Route for getting a specific course
@app.route('/api/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    
    # Get the category name if available
    category_name = None
    if course.category_id:
        category = Category.query.get(course.category_id)
        if category:
            category_name = category.name
            
    result = {
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'thumbnail': course.thumbnail,
        'price': float(course.price) if course.price else 0,
        'overall_rating': float(course.overall_rating) if course.overall_rating else 0,
        'difficulty_level': course.difficulty_level,
        'category_id': course.category_id,
        'category_name': category_name,
        'creator_id': course.creator_id,
        'created_at': course.created_at.isoformat() if course.created_at else None
    }
    return jsonify(result)

# Route for getting chapters of a course
@app.route('/api/courses/<int:course_id>/chapters', methods=['GET'])
def get_course_chapters(course_id):
    chapters = Chapter.query.filter_by(course_id=course_id).all()
    result = []
    for chapter in chapters:
        result.append({
            'id': chapter.id,
            'chapter_text': chapter.chapter_text,
            'video_link': chapter.video_link,
            'course_id': chapter.course_id
        })
    return jsonify(result)

# Add more routes as needed for categories, users, etc.

if __name__ == '__main__':
    app.run(debug=True)
```

3. Install required packages:
```
pip install flask flask-sqlalchemy flask-cors psycopg2-binary
```

## Frontend Configuration

1. Make sure the API_URL in `src/services/api.ts` points to your Flask server. By default, it's set to `http://localhost:5000/api`.

2. If your Flask server is running on a different port or host, update the API_URL accordingly.

## Testing the Connection

1. Start your Flask server:
```
python app.py
```

2. Start your React development server:
```
npm run dev
```

3. Visit your React app in the browser and check that it's able to fetch and display data from the Flask backend.

## Troubleshooting

- If you encounter CORS errors, make sure CORS is properly configured in your Flask app.
- Check the browser console for any error messages.
- Verify that your database connection is working correctly in the Flask app.
- Ensure your API routes match between the frontend and backend.
