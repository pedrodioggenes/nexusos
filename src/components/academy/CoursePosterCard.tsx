import { Play, Clock, BookOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Course } from "./types";

interface CoursePosterCardProps {
  course: Course;
  onClick?: () => void;
}

export function CoursePosterCard({ course, onClick }: CoursePosterCardProps) {
  const hasProgress = course.progress > 0 && course.progress < 100;
  const isCompleted = course.progress === 100;

  return (
    <div
      onClick={onClick}
      className="w-44 shrink-0 cursor-pointer group transition-all duration-300 border border-transparent hover:border-primary hover:-translate-y-1"
    >
      {/* Poster Image */}
      <div className="aspect-[3/4] rounded-2xl overflow-hidden relative bg-secondary">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--secondary)) 100%)`,
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <BookOpen className="h-16 w-16 text-muted-foreground" />
        </div>

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <div className="h-14 w-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 bg-primary">
            <Play className="h-6 w-6 text-primary-foreground fill-current ml-1" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {course.isNew && (
            <Badge className="text-[10px] font-semibold px-2 py-0.5 bg-primary text-primary-foreground">
              <Sparkles className="h-3 w-3 mr-1" />
              Novo
            </Badge>
          )}
          <Badge className="text-[10px] font-medium px-2 py-0.5 ml-auto bg-muted text-muted-foreground">
            {course.lessons} aulas
          </Badge>
        </div>

        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <Progress
              value={course.progress}
              className="h-1 bg-muted"
              indicatorClassName="bg-primary"
            />
          </div>
        )}

        {isCompleted && (
          <div className="absolute bottom-2 left-2">
            <Badge className="text-[10px] font-semibold px-2 py-0.5 bg-success text-success-foreground">
              Concluído
            </Badge>
          </div>
        )}
      </div>

      {/* Title and Meta */}
      <div className="mt-3 px-1">
        <h4 className="text-sm font-medium line-clamp-2 leading-tight text-foreground">
          {course.title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{course.duration}</span>
          <span>•</span>
          <span>{course.level}</span>
        </div>
      </div>
    </div>
  );
}
