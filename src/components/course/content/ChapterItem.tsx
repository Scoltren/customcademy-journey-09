
import React, { useState } from 'react';
import { Play, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Chapter } from '@/types/course';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ChapterItemProps {
  chapter: Chapter;
  index: number;
  completedChapters: number[];
  onMarkAsDone: (chapterId: number, progressValue: number | null) => void;
}

const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  index,
  completedChapters,
  onMarkAsDone
}) => {
  const [showVideo, setShowVideo] = useState(false);
  
  const toggleVideo = () => {
    setShowVideo(!showVideo);
  };
  
  return (
    <div className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold">{index + 1}</span>
        </div>
        <div className="w-full">
          <h3 className="text-xl font-bold mb-2">
            {chapter.title || chapter.chapter_text}
          </h3>
          <p className="text-slate-400 mb-4">
            {chapter.chapter_text}
          </p>
          
          {chapter.video_link && (
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 w-full justify-between"
                onClick={toggleVideo}
              >
                <div className="flex items-center gap-2">
                  <Play size={16} />
                  <span>Watch Video Lecture</span>
                </div>
                {showVideo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
              
              {showVideo && (
                <div className="rounded-md overflow-hidden border border-slate-700 bg-slate-900">
                  <div className="w-full">
                    <AspectRatio ratio={16/9}>
                      <video 
                        src={chapter.video_link} 
                        controls
                        className="w-full h-full object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </AspectRatio>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex flex-wrap items-center gap-3">
              {!completedChapters.includes(chapter.id) && (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-green-500 text-green-500 hover:bg-green-500/10"
                  onClick={() => onMarkAsDone(chapter.id, chapter.progress_when_finished)}
                >
                  <CheckCircle size={16} />
                  Mark as Done
                </Button>
              )}
              
              {completedChapters.includes(chapter.id) && (
                <span className="flex items-center gap-2 text-green-500">
                  <CheckCircle size={16} />
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterItem;
