
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import EnrollmentRequired from './EnrollmentRequired';

interface EnrollmentManagerProps {
  courseId: string | undefined;
  children: React.ReactNode;
}

// Component that manages access to course content based on enrollment status
const EnrollmentManager: React.FC<EnrollmentManagerProps> = ({ courseId, children }) => {
  const { user, isEnrolled } = useAuth();
  const [userEnrolled, setUserEnrolled] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check if user is enrolled in the course when component mounts
  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && courseId) {
        const enrolled = await isEnrolled(courseId);
        setUserEnrolled(enrolled);
      }
    };

    checkEnrollment();
  }, [user, courseId, isEnrolled]);

  // Handler for redirecting to login page when not logged in
  const handleLoginRedirect = () => {
    toast.info('Please log in to access course content');
    navigate('/login');
  };

  // Handler for scrolling to enrollment section when not enrolled
  const handleEnrollRedirect = () => {
    toast.info('You need to enroll in this course to access its content');
    const courseSection = document.querySelector('.course-header');
    if (courseSection) {
      courseSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Show login prompt if user is not logged in
  if (!user) {
    return <EnrollmentRequired type="login" onEnrollClick={handleLoginRedirect} />;
  }

  // Show enrollment prompt if user is not enrolled in the course
  if (!userEnrolled) {
    return <EnrollmentRequired type="enroll" onEnrollClick={handleEnrollRedirect} />;
  }

  // If user is logged in and enrolled, show the course content
  return <>{children}</>;
};

export default EnrollmentManager;
