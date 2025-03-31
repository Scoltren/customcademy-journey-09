
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  BookOpen,
  Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreatedCourses } from '@/hooks/useCreatedCourses';
import { Course } from '@/types/course';
import CourseEditForm from '../created-courses/CourseEditForm';
import ChapterManagement from '../created-courses/ChapterManagement';

const CreatedCoursesTab = () => {
  const navigate = useNavigate();
  const { createdCourses, isLoading, refetchCourses } = useCreatedCourses();
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');

  const handleCreateNew = () => {
    navigate('/create-course');
  };

  const handleEditCourse = (course: Course) => {
    setActiveCourse(course);
    setActiveTab('details');
  };

  const handleBack = () => {
    setActiveCourse(null);
    refetchCourses();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400">Loading your created courses...</p>
      </div>
    );
  }

  // Editing a specific course
  if (activeCourse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Editing: {activeCourse.title}</h2>
          <Button variant="outline" onClick={handleBack}>
            Back to Courses
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <CourseEditForm course={activeCourse} onSuccess={refetchCourses} />
          </TabsContent>

          <TabsContent value="chapters" className="space-y-4">
            <ChapterManagement courseId={activeCourse.id} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Courses list view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Courses You've Created</h2>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus size={16} />
          Create New Course
        </Button>
      </div>

      {createdCourses.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">No Courses Created Yet</h3>
          <p className="text-slate-400 mb-6">
            Start creating your first course to share your knowledge with others.
          </p>
          <Button onClick={handleCreateNew} className="mx-auto">
            Create Your First Course
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {createdCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden bg-slate-800 border-slate-700">
              <div className="aspect-video w-full overflow-hidden bg-slate-900">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-700">
                    <BookOpen className="h-10 w-10 text-slate-400" />
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-slate-400 text-sm mb-2">
                  Category: {course.categories?.name || 'Uncategorized'} 
                </p>
                <p className="text-slate-400 text-sm mb-2">
                  Price: ${course.price?.toFixed(2) || '0.00'}
                </p>
                <p className="text-slate-300 line-clamp-2 text-sm">
                  {course.description || 'No description provided.'}
                </p>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditCourse(course)}
                  className="flex items-center gap-2"
                >
                  <Edit size={14} />
                  Edit Course
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatedCoursesTab;
