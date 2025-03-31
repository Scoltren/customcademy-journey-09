
import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  PlayCircle,
  FileVideo,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CourseCreationService, ChapterFormData } from '@/services/CourseCreationService';
import { Chapter } from '@/types/course';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ChapterManagementProps {
  courseId: number;
}

const ChapterManagement: React.FC<ChapterManagementProps> = ({ courseId }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  
  // Form state
  const [chapterData, setChapterData] = useState<{
    title: string;
    chapter_text: string;
    progress_when_finished: number;
    video_file: File | null;
  }>({
    title: '',
    chapter_text: '',
    progress_when_finished: 25,
    video_file: null
  });

  const fetchChapters = async () => {
    setIsLoading(true);
    try {
      const data = await CourseCreationService.getCourseChapters(courseId);
      // Ensure all chapters have a title property
      const chaptersWithTitle = data.map(chapter => ({
        ...chapter,
        title: chapter.title || `Chapter ${chapter.id}`
      }));
      setChapters(chaptersWithTitle);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Failed to load chapters');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [courseId]);

  const resetForm = () => {
    setChapterData({
      title: '',
      chapter_text: '',
      progress_when_finished: 25,
      video_file: null
    });
    setSelectedChapter(null);
  };

  const handleOpenDialog = (chapter?: Chapter) => {
    if (chapter) {
      setSelectedChapter(chapter);
      setChapterData({
        title: chapter.title || '',
        chapter_text: chapter.chapter_text || '',
        progress_when_finished: chapter.progress_when_finished || 25,
        video_file: null
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setChapterData(prev => ({
      ...prev,
      [name]: name === 'progress_when_finished' ? parseInt(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setChapterData(prev => ({
        ...prev,
        video_file: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData: ChapterFormData = {
        title: chapterData.title,
        chapter_text: chapterData.chapter_text,
        progress_when_finished: chapterData.progress_when_finished,
        video_file: chapterData.video_file
      };

      if (selectedChapter) {
        // Update existing chapter
        await CourseCreationService.updateChapter(selectedChapter.id, formData);
      } else {
        // Create new chapter
        await CourseCreationService.addChapter(formData, courseId);
      }

      fetchChapters();
      handleCloseDialog();
      toast.success(selectedChapter ? 'Chapter updated successfully' : 'Chapter added successfully');
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error('Failed to save chapter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedChapter) return;
    
    try {
      await CourseCreationService.deleteChapter(selectedChapter.id);
      fetchChapters();
      toast.success('Chapter deleted successfully');
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error('Failed to delete chapter');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedChapter(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400">Loading chapters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Course Chapters</h2>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <Plus size={16} />
          Add Chapter
        </Button>
      </div>

      {chapters.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">No Chapters Yet</h3>
          <p className="text-slate-400 mb-6">
            Add chapters to your course to provide content for your students.
          </p>
          <Button onClick={() => handleOpenDialog()} className="mx-auto">
            Add Your First Chapter
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-slate-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="w-[150px]">Progress Value</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chapters.map((chapter, index) => (
                <TableRow key={chapter.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{chapter.title || 'Untitled Chapter'}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{chapter.chapter_text}</p>
                  </TableCell>
                  <TableCell>{chapter.progress_when_finished || 0}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(chapter)} title="Edit Chapter">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteConfirm(chapter)} title="Delete Chapter">
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                      {chapter.video_link && (
                        <Button variant="ghost" size="icon" 
                          onClick={() => window.open(chapter.video_link!, '_blank')}
                          title="View Video"
                        >
                          <PlayCircle size={16} className="text-green-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Chapter Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedChapter ? 'Edit Chapter' : 'Add New Chapter'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Chapter Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={chapterData.title}
                  onChange={handleInputChange}
                  placeholder="Enter chapter title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chapter_text">Chapter Content</Label>
                <Textarea
                  id="chapter_text"
                  name="chapter_text"
                  value={chapterData.chapter_text}
                  onChange={handleInputChange}
                  placeholder="Enter chapter content"
                  rows={5}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="progress_when_finished">
                  Progress When Completed (%)
                </Label>
                <Input
                  id="progress_when_finished"
                  name="progress_when_finished"
                  type="number"
                  min="1"
                  max="100"
                  value={chapterData.progress_when_finished}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-slate-400">
                  The percentage of course completion when this chapter is finished.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video_file">Video Lecture (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="video_file"
                    name="video_file"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {selectedChapter?.video_link && (
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedChapter.video_link!, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <FileVideo size={14} />
                      View Current
                    </Button>
                  )}
                </div>
                {selectedChapter?.video_link && (
                  <p className="text-xs text-slate-400">
                    Upload a new video to replace the current one, or leave empty to keep it.
                  </p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : selectedChapter ? 'Update Chapter' : 'Add Chapter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete this chapter? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChapterManagement;
