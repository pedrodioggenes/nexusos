import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CoursePosterCard } from "./CoursePosterCard";
import type { Course } from "./types";

interface CourseTrackSectionProps {
  title: string;
  courses: Course[];
  onViewAll?: () => void;
  onCourseClick?: (course: Course) => void;
}

export function CourseTrackSection({
  title,
  courses,
  onViewAll,
  onCourseClick,
}: CourseTrackSectionProps) {
  if (courses.length === 0) return null;

  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl font-bold"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#FAFAFA",
          }}
        >
          {title}
        </h2>
        <Button
          variant="ghost"
          onClick={onViewAll}
          className="text-sm font-medium gap-1 hover:bg-transparent group"
          style={{ color: "#71717A" }}
        >
          Ver todos
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Horizontal Scroll Carousel */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {courses.map((course) => (
            <CoursePosterCard
              key={course.id}
              course={course}
              onClick={() => onCourseClick?.(course)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-0" />
      </ScrollArea>
    </section>
  );
}
