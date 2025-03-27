
/**
 * API service for communicating with the Flask backend
 */

// Update this to your Flask server URL
const API_URL = 'http://localhost:5000/api';

/**
 * Generic fetch function with error handling
 */
async function fetchData<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Course API functions
 */
export const courseApi = {
  // Get all courses
  getCourses: () => fetchData<any[]>('/courses'),
  
  // Get course by ID
  getCourse: (id: string | number) => fetchData<any>(`/courses/${id}`),
  
  // Get course chapters
  getCourseChapters: (courseId: string | number) => 
    fetchData<any[]>(`/courses/${courseId}/chapters`),
};

/**
 * Category API functions
 */
export const categoryApi = {
  // Get all categories
  getCategories: () => fetchData<any[]>('/categories'),
};

/**
 * User API functions
 */
export const userApi = {
  // Login user
  login: (email: string, password: string) => 
    fetchData<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  // Register user
  register: (userData: any) => 
    fetchData<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  // Get user profile
  getProfile: () => fetchData<any>('/users/profile'),
  
  // Get user's enrolled courses
  getEnrolledCourses: () => fetchData<any[]>('/users/courses'),
  
  // Enroll in a course
  enrollCourse: (courseId: string | number) => 
    fetchData<any>('/users/courses', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    }),
};

// Export other API functions as needed

export default {
  course: courseApi,
  category: categoryApi,
  user: userApi,
};
