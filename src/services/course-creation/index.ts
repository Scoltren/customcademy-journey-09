
// Re-export all course creation services
export * from './types';
export { StorageService } from './storage-service';
export { CourseService } from './course-service';
export { ChapterService } from './chapter-service';
export { CategoryService } from './category-service';

// Create a unified CourseCreationService for backward compatibility
import { StorageService } from './storage-service';
import { CourseService } from './course-service';
import { ChapterService } from './chapter-service';
import { CategoryService } from './category-service';
import { CourseFormData, ChapterFormData, Category } from './types';

export class CourseCreationService {
  // Storage methods
  static uploadFile = StorageService.uploadFile;
  
  // Course methods
  static createCourse = CourseService.createCourse;
  static getCreatedCourses = CourseService.getCreatedCourses;
  static updateCourse = CourseService.updateCourse;
  static deleteCourse = CourseService.deleteCourse;
  
  // Chapter methods
  static addChapter = ChapterService.addChapter;
  static getCourseChapters = ChapterService.getCourseChapters;
  static updateChapter = ChapterService.updateChapter;
  static deleteChapter = ChapterService.deleteChapter;
  
  // Category methods
  static getCategories = CategoryService.getCategories;
}
