import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AcademySidebar,
  AcademyHeroBanner,
  ContinueLearningSection,
  CourseTrackSection,
  AcademyLoadingSkeleton,
  mockCourses,
  type Course,
} from "@/components/academy";

type ActiveSection = "home" | "my-courses" | "certificates" | "favorites";
type ActiveTrack = "vendas" | "lideranca" | "operacional" | "onboarding" | null;

const AcademyPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [activeTrack, setActiveTrack] = useState<ActiveTrack>(null);

  // Get featured course for hero
  const featuredCourse = useMemo(
    () => mockCourses.find((c) => c.isFeatured) || mockCourses[0],
    []
  );

  // Get courses in progress (for "Continue Learning")
  const inProgressCourses = useMemo(
    () => mockCourses.filter((c) => c.progress > 0 && c.progress < 100),
    []
  );

  // Group courses by track
  const coursesByTrack = useMemo(() => {
    const grouped: Record<string, Course[]> = {
      vendas: [],
      lideranca: [],
      operacional: [],
      onboarding: [],
    };
    mockCourses.forEach((course) => {
      if (grouped[course.track]) {
        grouped[course.track].push(course);
      }
    });
    return grouped;
  }, []);

  // Handle course click
  const handleCourseClick = (course: Course) => {
    toast.info(`Abrindo: ${course.title}`, {
      description: "Sistema de player será implementado em breve",
    });
  };

  // Handle watch from hero
  const handleWatch = () => {
    handleCourseClick(featuredCourse);
  };

  // Handle add to list
  const handleAddToList = () => {
    toast.success("Adicionado à sua lista!", {
      description: featuredCourse.title,
    });
  };

  // Redirect if not authenticated
  if (!loading && !user) {
    navigate("/auth");
    return null;
  }

  // Show loading skeleton
  if (loading) {
    return <AcademyLoadingSkeleton />;
  }

  // Filter content based on active track
  const getFilteredContent = () => {
    if (activeTrack) {
      return (
        <CourseTrackSection
          title={activeTrack.charAt(0).toUpperCase() + activeTrack.slice(1)}
          courses={coursesByTrack[activeTrack]}
          onCourseClick={handleCourseClick}
        />
      );
    }

    // Default home view
    return (
      <>
        {/* Continue Learning */}
        <ContinueLearningSection
          courses={inProgressCourses}
          onCourseClick={handleCourseClick}
        />

        {/* Track Sections */}
        <CourseTrackSection
          title="Vendas"
          courses={coursesByTrack.vendas}
          onCourseClick={handleCourseClick}
        />
        <CourseTrackSection
          title="Liderança"
          courses={coursesByTrack.lideranca}
          onCourseClick={handleCourseClick}
        />
        <CourseTrackSection
          title="Operacional"
          courses={coursesByTrack.operacional}
          onCourseClick={handleCourseClick}
        />
        <CourseTrackSection
          title="Onboarding"
          courses={coursesByTrack.onboarding}
          onCourseClick={handleCourseClick}
        />
      </>
    );
  };

  return (
    <div className="h-screen flex" style={{ backgroundColor: "#0f0f10" }}>
      {/* Sidebar */}
      <AcademySidebar
        activeSection={activeSection}
        activeTrack={activeTrack}
        onSectionChange={setActiveSection}
        onTrackChange={setActiveTrack}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Hero Banner */}
        <AcademyHeroBanner
          course={featuredCourse}
          onWatch={handleWatch}
          onAddToList={handleAddToList}
        />

        {/* Content Sections */}
        <div className="px-6 lg:px-8 py-8 space-y-12">{getFilteredContent()}</div>
      </main>
    </div>
  );
};

export default AcademyPage;
