
import React from 'react';
import { CheckCircle } from 'lucide-react';

const CourseFeatures: React.FC = () => {
  return (
    <section className="container mx-auto px-6 mb-12">
      <h2 className="heading-md mb-6">What You'll Learn</h2>
      
      <div className="glass-card p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Build professional web applications with modern technologies",
            "Understand key programming concepts and best practices",
            "Deploy applications to production environments",
            "Collaborate effectively with development teams",
            "Debug common issues in your applications",
            "Follow industry standard security practices"
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseFeatures;
