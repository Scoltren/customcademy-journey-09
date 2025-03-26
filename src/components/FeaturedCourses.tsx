
import React from 'react';
import { Link } from 'react-router-dom';
import CourseCard, { CourseProps } from './CourseCard';
import { ArrowRight } from 'lucide-react';

// Sample course data
const featuredCourses: CourseProps[] = [
  {
    id: '1',
    title: 'Advanced Web Development Masterclass 2023',
    description: 'Learn modern web development with the latest technologies. This comprehensive course covers frontend, backend, and deployment.',
    instructor: 'Dr. Sarah Mitchell',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
    category: 'Web Development',
    level: 'Advanced',
    duration: '40 hours',
    students: 12543,
    rating: 4.9,
    price: 89.99,
    featured: true
  },
  {
    id: '2',
    title: 'Machine Learning for Beginners',
    description: 'Your first step into the world of AI and machine learning. Perfect for beginners with basic programming knowledge.',
    instructor: 'Prof. Alex Johnson',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Data Science',
    level: 'Beginner',
    duration: '28 hours',
    students: 9872,
    rating: 4.7,
    price: 69.99
  },
  {
    id: '3',
    title: 'Digital Marketing Fundamentals',
    description: 'Master the essential skills needed for modern digital marketing. From SEO to social media strategies and analytics.',
    instructor: 'Emma Rodriguez',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80',
    category: 'Marketing',
    level: 'Intermediate',
    duration: '22 hours',
    students: 7654,
    rating: 4.5,
    price: 59.99
  },
  {
    id: '4',
    title: 'The Complete Mobile App Development',
    description: 'Create cross-platform mobile applications using React Native. Build and deploy for iOS and Android.',
    instructor: 'David Chen',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    category: 'Mobile Development',
    level: 'Intermediate',
    duration: '35 hours',
    students: 6321,
    rating: 4.8,
    price: 79.99
  },
  {
    id: '5',
    title: 'Cybersecurity Essentials',
    description: 'Protect yourself and your organization from cyber threats. Learn penetration testing, threat detection, and security best practices.',
    instructor: 'Michael Thompson',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Cybersecurity',
    level: 'Advanced',
    duration: '30 hours',
    students: 5432,
    rating: 4.6,
    price: 99.99
  }
];

const FeaturedCourses = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm font-medium mb-4">
              Featured Courses
            </span>
            <h2 className="heading-lg">Top Courses to <span className="text-gradient">Get You Started</span></h2>
          </div>
          
          <Link to="/courses" className="button-secondary flex items-center gap-2 mt-4 md:mt-0">
            View All Courses <ArrowRight size={18} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course, index) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              className={index === 0 ? "lg:col-span-3" : ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
