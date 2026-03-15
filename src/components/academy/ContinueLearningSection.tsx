import { Play, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Course } from "./types";

interface ContinueLearningSectionProps {
  courses: Course[];
  onCourseClick?: (course: Course) => void;
}

export function ContinueLearningSection({ courses, onCourseClick }: ContinueLearningSectionProps) {
  if (courses.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 font-display text-foreground">
        Continue de Onde Parou
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => onCourseClick?.(course)}
            className="flex rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] bg-secondary border border-border hover:border-primary"
          >
            {/* Thumbnail */}
            <div className="w-36 lg:w-40 aspect-video shrink-0 relative overflow-hidden bg-muted">
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--secondary)) 100%)`,
                }}
              />

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary">
                  <Play className="h-4 w-4 text-primary-foreground fill-current ml-0.5" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0">
                <div
                  className="h-1 bg-primary"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
              <div>
                <h3 className="text-sm font-semibold line-clamp-1 mb-1 text-foreground">
                  {course.title}
                </h3>
                <p className="text-xs line-clamp-1 text-muted-foreground">
                  {course.currentLesson || `Aula ${Math.ceil(course.lessons * (course.progress / 100))} de ${course.lessons}`}
                </p>
              </div>

              <div className="mt-3 space-y-2">
                <Progress
                  value={course.progress}
                  className="h-1.5 bg-muted"
                  indicatorClassName="bg-primary"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{course.duration}</span>
                  </div>
                  <span>{course.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
