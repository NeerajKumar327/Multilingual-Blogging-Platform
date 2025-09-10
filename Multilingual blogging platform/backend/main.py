from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import json
import os
from uuid import uuid4

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Data storage paths
USERS_FILE = "backend/data/users.json"
POSTS_FILE = "backend/data/posts.json"
COMMENTS_FILE = "backend/data/comments.json"

# Ensure data directory exists
os.makedirs("backend/data", exist_ok=True)

# Initialize data files if they don't exist
def init_data_files():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump([], f)
    if not os.path.exists(POSTS_FILE):
        with open(POSTS_FILE, 'w') as f:
            json.dump([], f)
    if not os.path.exists(COMMENTS_FILE):
        with open(COMMENTS_FILE, 'w') as f:
            json.dump([], f)

init_data_files()

# Models
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class Post(BaseModel):
    title: str
    content: str
    language: str
    tags: List[str] = []

class Comment(BaseModel):
    post_id: str
    content: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def load_data(file_path):
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except:
        return []

def save_data(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2, default=str)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    users = load_data(USERS_FILE)
    user = next((u for u in users if u["email"] == email), None)
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.post("/register", response_model=Token)
async def register(user: UserRegister):
    users = load_data(USERS_FILE)
    
    # Check if user exists
    if any(u["email"] == user.email for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = {
        "id": str(uuid4()),
        "username": user.username,
        "email": user.email,
        "password": get_password_hash(user.password),
        "full_name": user.full_name,
        "created_at": datetime.now().isoformat()
    }
    
    users.append(new_user)
    save_data(USERS_FILE, users)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
async def login(user: UserLogin):
    users = load_data(USERS_FILE)
    db_user = next((u for u in users if u["email"] == user.email), None)
    
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "full_name": current_user["full_name"]
    }

@app.post("/posts")
async def create_post(post: Post, current_user: dict = Depends(get_current_user)):
    posts = load_data(POSTS_FILE)
    
    new_post = {
        "id": str(uuid4()),
        "title": post.title,
        "content": post.content,
        "language": post.language,
        "tags": post.tags,
        "author_id": current_user["id"],
        "author_name": current_user["username"],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    posts.append(new_post)
    save_data(POSTS_FILE, posts)
    return new_post

@app.get("/posts")
async def get_posts(language: Optional[str] = None):
    posts = load_data(POSTS_FILE)
    
    if language:
        posts = [p for p in posts if p["language"] == language]
    
    return sorted(posts, key=lambda x: x["created_at"], reverse=True)

@app.get("/posts/{post_id}")
async def get_post(post_id: str):
    posts = load_data(POSTS_FILE)
    post = next((p for p in posts if p["id"] == post_id), None)
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return post

@app.put("/posts/{post_id}")
async def update_post(post_id: str, post: Post, current_user: dict = Depends(get_current_user)):
    posts = load_data(POSTS_FILE)
    post_index = next((i for i, p in enumerate(posts) if p["id"] == post_id), None)
    
    if post_index is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if posts[post_index]["author_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    
    posts[post_index].update({
        "title": post.title,
        "content": post.content,
        "language": post.language,
        "tags": post.tags,
        "updated_at": datetime.now().isoformat()
    })
    
    save_data(POSTS_FILE, posts)
    return posts[post_index]

@app.delete("/posts/{post_id}")
async def delete_post(post_id: str, current_user: dict = Depends(get_current_user)):
    posts = load_data(POSTS_FILE)
    post_index = next((i for i, p in enumerate(posts) if p["id"] == post_id), None)
    
    if post_index is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if posts[post_index]["author_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    deleted_post = posts.pop(post_index)
    save_data(POSTS_FILE, posts)
    return {"message": "Post deleted successfully"}

@app.post("/posts/{post_id}/comments")
async def create_comment(post_id: str, comment: Comment, current_user: dict = Depends(get_current_user)):
    comments = load_data(COMMENTS_FILE)
    
    new_comment = {
        "id": str(uuid4()),
        "post_id": post_id,
        "content": comment.content,
        "author_id": current_user["id"],
        "author_name": current_user["username"],
        "created_at": datetime.now().isoformat()
    }
    
    comments.append(new_comment)
    save_data(COMMENTS_FILE, comments)
    return new_comment

@app.get("/posts/{post_id}/comments")
async def get_comments(post_id: str):
    comments = load_data(COMMENTS_FILE)
    post_comments = [c for c in comments if c["post_id"] == post_id]
    return sorted(post_comments, key=lambda x: x["created_at"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)