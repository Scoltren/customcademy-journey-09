
import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnrollmentRequiredProps {
  onEnrollClick: () => void;
  type: 'login' | 'enroll';
}

const EnrollmentRequired: React.FC<EnrollmentRequiredProps> = ({ onEnrollClick, type }) => {
  const title = type === 'login' ? 'Login Required' : 'Enrollment Required';
  const description = type === 'login' 
    ? 'You need to be logged in to view course content.' 
    : 'You need to enroll in this course to access its content.';
  const buttonText = type === 'login' ? 'Login to Continue' : 'Enroll Now';

  return (
    <section className="container mx-auto px-6 mb-12">
      <h2 className="heading-md mb-6">Course Content</h2>
      <div className="glass-card p-8 text-center">
        <Lock className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-slate-400 mb-6">{description}</p>
        <Button onClick={onEnrollClick} className="button-primary">
          {buttonText}
        </Button>
      </div>
    </section>
  );
};

export default EnrollmentRequired;
