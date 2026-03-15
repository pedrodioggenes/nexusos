import {
  LandingHeader,
  HeroSection,
  BentoModules,
  PlatformStats,
  EcosystemFeatures,
  HowItWorks,
  UseCases,
  SocialProof,
  TrustSection,
  FinalCTA,
  ArchitectureFooter,
} from '@/components/landing';

/**
 * LandingPage - Festval Matte Architecture
 * 
 * The monumental gateway to the Nexus OS Ecosystem.
 * Design: Sober, elegant, physical materiality translated to digital.
 * No glows, no neons, solid surfaces with subtle borders.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-festval-charcoal text-festval-ivory overflow-x-hidden">
      {/* Fixed minimal header */}
      <LandingHeader />

      {/* Hero Section - Full-screen cinematographic */}
      <HeroSection />

      {/* Platform Stats - Impressive numbers */}
      <PlatformStats />

      {/* Bento Modules Section - All apps */}
      <section id="aplicativos">
        <BentoModules />
      </section>

      {/* How It Works - User journey */}
      <HowItWorks />

      {/* Ecosystem Features - Technical differentiators */}
      <EcosystemFeatures />

      {/* Use Cases - Before/After transformations */}
      <UseCases />

      {/* Social Proof Section - Testimonials */}
      <SocialProof />

      {/* Trust/Security Section - Simple icons */}
      <TrustSection />

      {/* Final CTA Section - Large copper button */}
      <FinalCTA />

      {/* Architecture Footer - Multi-column */}
      <ArchitectureFooter />
    </div>
  );
}
