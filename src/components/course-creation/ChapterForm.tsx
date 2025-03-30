
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploader } from './FileUploader';
import { CourseCreationService, ChapterFormData } from '@/services/CourseCreationService';
import { Progress } from '@/components/ui/progress';

const chapterFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  chapter_text: z.string().min(20, 'Content must be at least 20 characters'),
  progress_when_finished: z.coerce.number().min(1, 'Progress must be at least 1').max(100, 'Progress cannot exceed 100'),
  video_file: z.any().optional(),
});

interface ChapterFormProps {
  courseId: number;
  onPublishCourse: () => void;
}

export const ChapterForm = ({ courseId, onPublishCourse }: ChapterFormProps) => {
  const [chapters, setChapters] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [totalProgress, setTotalProgress] = useState(0);
  const [remainingProgress, setRemainingProgress] = useState(100);
  
  const form = useForm<z.infer<typeof chapterFormSchema>>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      title: '',
      chapter_text: '',
      progress_when_finished: remainingProgress > 0 ? remainingProgress : 0,
    },
  });
  
  // Update the form value whenever remainingProgress changes
  useEffect(() => {
    const currentValue = form.getValues('progress_when_finished');
    // Only auto-update if the field hasn't been manually changed or if it exceeds remaining
    if (!currentValue || currentValue > remainingProgress) {
      form.setValue('progress_when_finished', 
        remainingProgress > 0 ? remainingProgress : 0, 
        { shouldValidate: true }
      );
    }
  }, [remainingProgress, form]);
  
  // Calculate total progress and remaining progress whenever chapters change
  useEffect(() => {
    const total = chapters.reduce((sum, chapter) => sum + (chapter.progress_when_finished || 0), 0);
    setTotalProgress(total);
    setRemainingProgress(100 - total);
  }, [chapters]);
  
  const addChapter = async (values: z.infer<typeof chapterFormSchema>) => {
    // Validate that we're not exceeding 100% total progress
    const newTotalProgress = totalProgress + values.progress_when_finished;
    if (newTotalProgress > 100) {
      toast.error(`Total progress (${newTotalProgress}%) exceeds 100%. Please adjust the progress value.`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const chapterData: ChapterFormData = {
        title: values.title,
        chapter_text: values.chapter_text,
        progress_when_finished: values.progress_when_finished,
        video_file: videoFile
      };
      
      const chapter = await CourseCreationService.addChapter(chapterData, courseId);
      
      setChapters([...chapters, chapter]);
      toast.success('Chapter added successfully!');
      
      // Reset form
      form.reset({
        title: '',
        chapter_text: '',
        progress_when_finished: remainingProgress - values.progress_when_finished > 0 
          ? remainingProgress - values.progress_when_finished 
          : 0,
      });
      setVideoFile(null);
    } catch (error) {
      console.error('Chapter creation error:', error);
      toast.error('Failed to add chapter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const removeChapter = (index: number) => {
    const updatedChapters = [...chapters];
    updatedChapters.splice(index, 1);
    setChapters(updatedChapters);
    toast.info('Chapter removed');
  };
  
  const handlePublish = () => {
    if (chapters.length < 2) {
      toast.error('Please add at least 2 chapters before publishing');
      return;
    }
    
    // Check if total progress adds up to 100%
    if (totalProgress < 100) {
      toast.error(`Total progress (${totalProgress}%) must be 100% before publishing. Add more chapters or adjust progress values.`);
      return;
    }
    
    toast.success('Course published successfully!');
    onPublishCourse();
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Chapters</CardTitle>
          <CardDescription>
            Add at least 2 chapters to your course. You can add up to 10 chapters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Total Progress: {totalProgress}%</span>
              <span className="text-sm font-medium">Remaining: {remainingProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
            {totalProgress > 100 && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Total progress exceeds 100%. Please adjust chapter progress values.
              </p>
            )}
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addChapter)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduction to the course" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="chapter_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write the content of your chapter here..." 
                        className="h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="progress_when_finished"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress When Completed (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max={remainingProgress > 0 ? remainingProgress : 100}
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > remainingProgress) {
                            toast.warning(`This value exceeds the remaining progress (${remainingProgress}%)`);
                          }
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      How much progress (%) should be added when this chapter is completed.
                      {remainingProgress > 0 && ` Suggested value: ${remainingProgress}%`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="video_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter Video</FormLabel>
                    <FormControl>
                      <FileUploader
                        accept="video/*"
                        onChange={(file) => {
                          setVideoFile(file);
                          field.onChange(file);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a video for this chapter.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={isSubmitting || chapters.length >= 10 || remainingProgress <= 0}
                className="w-full flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Chapter...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Add Chapter
                  </>
                )}
              </Button>
              
              {chapters.length >= 10 && (
                <p className="text-amber-500 text-sm text-center">
                  You've reached the maximum number of chapters (10).
                </p>
              )}
              
              {remainingProgress <= 0 && (
                <p className="text-amber-500 text-sm text-center">
                  Total progress is already at 100%. Remove or adjust existing chapters to add more.
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {chapters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chapter List</CardTitle>
            <CardDescription>You've added {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chapters.map((chapter, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{chapter.title || `Chapter ${index + 1}`}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Progress: {chapter.progress_when_finished}%
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeChapter(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Alert className="mt-4">
              <AlertDescription>
                {totalProgress < 100 ? (
                  `Total progress is ${totalProgress}%. You need to reach 100% before publishing.`
                ) : totalProgress > 100 ? (
                  `Total progress exceeds 100% (${totalProgress}%). Please adjust chapter progress values.`
                ) : chapters.length < 2 ? (
                  `Please add at least one more chapter before publishing.`
                ) : (
                  `You're ready to publish your course!`
                )}
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handlePublish} 
              className="w-full mt-6"
              disabled={totalProgress !== 100 || chapters.length < 2}
            >
              Publish Course
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
