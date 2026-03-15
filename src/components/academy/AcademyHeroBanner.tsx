import { Play, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Course } from "./types";

interface AcademyHeroBannerProps {
  course: Course;
  onWatch?: () => void;
  onAddToList?: () => void;
}

export function AcademyHeroBanner({ course, onWatch, onAddToList }: AcademyHeroBannerProps) {
  const hasProgress = course.progress > 0;

  return (
    <div className="relative h-[400px] w-full overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-secondary">
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, hsl(var(--background) / 0.95) 0%, hsl(var(--background) / 0.8) 50%, hsl(var(--background) / 0.6) 100%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center px-8 lg:px-12">
        <div className="max-w-xl space-y-5">
          {/* Featured badge */}
          <div className="flex items-center gap-2">
            <Badge className="text-xs font-semibold px-3 py-1 bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1.5 fill-current" />
              Curso em Destaque
            </Badge>
            <Badge className="text-xs font-medium px-2 py-1 bg-muted text-muted-foreground">
              {course.level}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight font-display text-foreground">
            {course.title}
          </h1>

          {/* Description */}
          <p className="text-base lg:text-lg leading-relaxed max-w-md text-muted-foreground">
            {course.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{course.lessons} aulas</span>
            <span>•</span>
            <span>{course.duration}</span>
            <span>•</span>
            <span>Trilha: {course.track.charAt(0).toUpperCase() + course.track.slice(1)}</span>
          </div>

          {/* Progress bar if in progress */}
          {hasProgress && (
            <div className="max-w-sm space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{course.currentLesson || `Aula ${Math.ceil(course.lessons * (course.progress / 100))} de ${course.lessons}`}</span>
                <span>{course.progress}% concluído</span>
              </div>
              <Progress
                value={course.progress}
                className="h-2 bg-muted"
                indicatorClassName="bg-primary"
              />
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              onClick={onWatch}
              className="h-12 px-8 text-base font-semibold rounded-xl gap-2 transition-all hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Play className="h-5 w-5 fill-current" />
              {hasProgress ? "Continuar" : "Assistir Agora"}
            </Button>
            <Button
              onClick={onAddToList}
              variant="outline"
              className="h-12 px-6 text-base font-medium rounded-xl gap-2 bg-transparent border-border text-foreground"
            >
              <Plus className="h-5 w-5" />
              Minha Lista
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
