import { memo } from 'react';
import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  suggestedQuestions: string[];
  onSelectQuestion: (question: string) => void;
  composerSlot: React.ReactNode;
}

export const WelcomeScreen = memo(function WelcomeScreen({
  suggestedQuestions,
  onSelectQuestion,
  composerSlot
}: WelcomeScreenProps) {
  return (
    <div className="h-full min-h-0 overflow-y-auto flex flex-col relative">
      <div className="flex-1 flex items-center justify-center px-4 py-8 pb-24">
        <div className="text-center max-w-3xl w-full">
          {/* Sparkles icon - coral/orange like Claude */}
          <div className="mb-6">
            <Sparkles className="h-10 w-10 mx-auto text-[#EA580C]" />
          </div>

          {/* Large greeting */}
          <h1 
            className="text-4xl md:text-5xl font-semibold mb-10 tracking-tight text-foreground font-display"
          >
            Como posso ajudar?
          </h1>

          {/* Composer */}
          <div className="max-w-xl mx-auto">
            {composerSlot}
          </div>
        </div>
      </div>
    </div>
  );
});

export default WelcomeScreen;
