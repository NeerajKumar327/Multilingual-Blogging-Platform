// Local storage utilities for data persistence
import { AuthResponse, LoginData, RegisterData, Post, CreatePostData, Comment, CreateCommentData, User } from '../types';

// Local storage keys
const USERS_KEY = 'blogsphere_users';
const POSTS_KEY = 'blogsphere_posts';
const COMMENTS_KEY = 'blogsphere_comments';
const CURRENT_USER_KEY = 'blogsphere_current_user';

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Mock delay for realistic API feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Hash password (simple implementation for demo)
const hashPassword = (password: string) => {
  return btoa(password + 'salt123');
};

const verifyPassword = (password: string, hash: string) => {
  return hashPassword(password) === hash;
};

// Initialize with sample data
const initializeSampleData = () => {
  const users = getFromStorage<User>(USERS_KEY);
  const posts = getFromStorage<Post>(POSTS_KEY);
  
  if (users.length === 0) {
    const sampleUsers: User[] = [
      {
        id: 'user1',
        username: 'johndoe',
        email: 'john@example.com',
        full_name: 'John Doe',
        created_at: new Date().toISOString()
      },
      {
        id: 'user2',
        username: 'janedoe',
        email: 'jane@example.com',
        full_name: 'Jane Doe',
        created_at: new Date().toISOString()
      }
    ];
    saveToStorage(USERS_KEY, sampleUsers);
  }

  if (posts.length === 0) {
    const samplePosts: Post[] = [
      {
        id: 'post1',
        title: 'Welcome to BlogSphere',
        content: '<p>This is a sample blog post to demonstrate the multilingual blogging platform. You can create, edit, and delete posts in multiple languages!</p>',
        language: 'en',
        tags: ['welcome', 'demo', 'blogging'],
        author_id: 'user1',
        author_name: 'johndoe',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'post2',
        title: 'Bienvenido a BlogSphere',
        content: '<p>Esta es una publicación de blog de muestra para demostrar la plataforma de blogs multilingüe. ¡Puedes crear, editar y eliminar publicaciones en varios idiomas!</p>',
        language: 'es',
        tags: ['bienvenida', 'demo', 'blog'],
        author_id: 'user2',
        author_name: 'janedoe',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'post3',
        title: 'BlogSphereへようこそ',
        content: '<p>これは多言語ブログプラットフォームを実演するためのサンプルブログ投稿です。複数の言語で投稿を作成、編集、削除できます！</p>',
        language: 'ja',
        tags: ['ようこそ', 'デモ', 'ブログ'],
        author_id: 'user1',
        author_name: 'johndoe',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        updated_at: new Date(Date.now() - 259200000).toISOString()
      }
    ];
    saveToStorage(POSTS_KEY, samplePosts);
  }
};

// Initialize sample data on first load
initializeSampleData();

// Auth API
export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    await delay(500);
    const users = getFromStorage<any>(USERS_KEY);
    const user = users.find((u: any) => u.email === data.email);
    
    if (!user || !verifyPassword(data.password, user.password)) {
      throw new Error('Invalid credentials');
    }
    
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    return {
      access_token: token,
      token_type: 'bearer'
    };
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    await delay(500);
    const users = getFromStorage<any>(USERS_KEY);
    
    if (users.find((u: any) => u.email === data.email)) {
      throw new Error('Email already registered');
    }
    
    const newUser = {
      id: generateId(),
      username: data.username,
      email: data.email,
      password: hashPassword(data.password),
      full_name: data.full_name,
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    saveToStorage(USERS_KEY, users);
    
    const token = btoa(JSON.stringify({ userId: newUser.id, email: newUser.email }));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    
    return {
      access_token: token,
      token_type: 'bearer'
    };
  },
  
  getMe: async (): Promise<User> => {
    await delay(200);
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    const user = JSON.parse(currentUser);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at
    };
  },
};

// Posts API
export const postsAPI = {
  getPosts: async (language?: string): Promise<Post[]> => {
    await delay(300);
    let posts = getFromStorage<Post>(POSTS_KEY);
    
    if (language) {
      posts = posts.filter(post => post.language === language);
    }
    
    return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  
  getPost: async (id: string): Promise<Post> => {
    await delay(200);
    const posts = getFromStorage<Post>(POSTS_KEY);
    const post = posts.find(p => p.id === id);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    return post;
  },
  
  createPost: async (data: CreatePostData): Promise<Post> => {
    await delay(500);
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    const user = JSON.parse(currentUser);
    const posts = getFromStorage<Post>(POSTS_KEY);
    
    const newPost: Post = {
      id: generateId(),
      title: data.title,
      content: data.content,
      language: data.language,
      tags: data.tags,
      author_id: user.id,
      author_name: user.username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    posts.push(newPost);
    saveToStorage(POSTS_KEY, posts);
    
    return newPost;
  },
  
  updatePost: async (id: string, data: CreatePostData): Promise<Post> => {
    await delay(500);
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    const user = JSON.parse(currentUser);
    const posts = getFromStorage<Post>(POSTS_KEY);
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    
    if (posts[postIndex].author_id !== user.id) {
      throw new Error('Not authorized');
    }
    
    posts[postIndex] = {
      ...posts[postIndex],
      title: data.title,
      content: data.content,
      language: data.language,
      tags: data.tags,
      updated_at: new Date().toISOString()
    };
    
    saveToStorage(POSTS_KEY, posts);
    return posts[postIndex];
  },
  
  deletePost: async (id: string): Promise<void> => {
    await delay(300);
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    const user = JSON.parse(currentUser);
    const posts = getFromStorage<Post>(POSTS_KEY);
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    
    if (posts[postIndex].author_id !== user.id) {
      throw new Error('Not authorized');
    }
    
    posts.splice(postIndex, 1);
    saveToStorage(POSTS_KEY, posts);
  },
};

// Comments API
export const commentsAPI = {
  getComments: async (postId: string): Promise<Comment[]> => {
    await delay(200);
    const comments = getFromStorage<Comment>(COMMENTS_KEY);
    return comments
      .filter(c => c.post_id === postId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },
  
  createComment: async (postId: string, data: CreateCommentData): Promise<Comment> => {
    await delay(300);
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    const user = JSON.parse(currentUser);
    const comments = getFromStorage<Comment>(COMMENTS_KEY);
    
    const newComment: Comment = {
      id: generateId(),
      post_id: postId,
      content: data.content,
      author_id: user.id,
      author_name: user.username,
      created_at: new Date().toISOString()
    };
    
    comments.push(newComment);
    saveToStorage(COMMENTS_KEY, comments);
    
    return newComment;
  },
};