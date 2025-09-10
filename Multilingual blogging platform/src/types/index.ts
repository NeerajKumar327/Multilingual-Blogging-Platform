export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  created_at?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  language: string;
  tags: string[];
}

export interface CreateCommentData {
  post_id: string;
  content: string;
}