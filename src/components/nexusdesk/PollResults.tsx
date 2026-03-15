import { useHWPoll, useVoteOnPoll, type HWPoll } from "@/hooks/useHWPolls";
import { BarChart3, Check } from "lucide-react";
import { motion } from "framer-motion";

interface PollResultsProps {
  postId: string;
}

export function PollResults({ postId }: PollResultsProps) {
  const { data: poll, isLoading } = useHWPoll(postId);
  const vote = useVoteOnPoll();

  if (isLoading || !poll) return null;

  const isClosed = poll.closes_at && new Date(poll.closes_at) < new Date();
  const hasVoted = poll.userVote !== undefined;

  const handleVote = (optionIndex: number) => {
    if (isClosed) return;
    vote.mutate({ pollId: poll.id, optionIndex, postId });
  };

  return (
    <div className="mt-3 rounded-lg p-3 space-y-2 bg-festval-graphite" style={{ border: '1px solid hsl(var(--festval-border))' }}>
      <div className="flex items-center gap-1.5 mb-2">
        <BarChart3 className="h-3.5 w-3.5" style={{ color: '#3B82F6' }} />
        <span className="text-xs font-semibold text-festval-ivory">{poll.question}</span>
      </div>

      <div className="space-y-1.5">
        {poll.options.map((opt, i) => {
          const voteCount = poll.votes.find(v => v.option_index === i)?.count || 0;
          const pct = poll.totalVotes > 0 ? Math.round((voteCount / poll.totalVotes) * 100) : 0;
          const isSelected = poll.userVote === i;

          return (
            <button
              key={i}
              onClick={() => handleVote(i)}
              disabled={!!isClosed || vote.isPending}
              className="w-full relative rounded-md overflow-hidden text-left transition-colors"
              style={{
                backgroundColor: 'hsl(var(--festval-border))',
                border: isSelected ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
              }}
            >
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-y-0 left-0 rounded-md"
                  style={{ backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(161, 161, 170, 0.1)' }}
                />
              )}
              <div className="relative flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  {isSelected && <Check className="h-3 w-3" style={{ color: '#3B82F6' }} />}
                  <span className="text-xs" style={{ color: isSelected ? '#3B82F6' : 'hsl(var(--festval-ivory))' }}>{opt}</span>
                </div>
                {hasVoted && (
                  <span className="text-[10px] font-medium text-festval-stone">{pct}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px]" style={{ color: 'hsl(var(--festval-stone-muted))' }}>
          {poll.totalVotes} voto{poll.totalVotes !== 1 ? 's' : ''}
        </span>
        {isClosed && (
          <span className="text-[10px] font-medium" style={{ color: '#EF4444' }}>Encerrada</span>
        )}
      </div>
    </div>
  );
}
