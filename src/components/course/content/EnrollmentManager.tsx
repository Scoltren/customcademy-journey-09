
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import EnrollmentRequired from './EnrollmentRequired';

interface EnrollmentManagerProps {
  courseId: string | undefined;
  children: React.ReactNode;
}

const EnrollmentManager: React.FC<EnrollmentManagerProps> = ({ courseId, children }) => {
  const { user, isEnrolled } = useAuth();
  const [userEnrolled, setUserEnrolled] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && courseId) {
        const enrolled = await isEnrolled(courseId);
        setUserEnrolled(enrolled);
      }
    };

    checkEnrollment();
  }, [user, courseId, isEnrolled]);

  const handleLoginRedirect = () => {
    toast.info('Please log in to access course content');
    navigate('/login');
  };

  const handleEnrollRedirect = () => {
    toast.info('You need to enroll in this course to access its content');
    const courseSection = document.querySelector('.course-header');
    if (courseSection) {
      courseSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!user) {
    return <EnrollmentRequired type="login" onEnrollClick={handleLoginRedirect} />;
  }

  if (!userEnrolled) {
    return <EnrollmentRequired type="enroll" onEnrollClick={handleEnrollRedirect} />;
  }

  return <>{children}</>;
};

export default EnrollmentManager;
