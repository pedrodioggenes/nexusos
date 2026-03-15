import { Clock, Hash, FileText } from 'lucide-react';

interface ResponseMetricsProps {
  responseTime?: number;
  content: string;
  isDarkMode: boolean;
}

export function ResponseMetrics({ responseTime, content, isDarkMode }: ResponseMetricsProps) {
  const estimatedTokens = Math.ceil(content.length / 4);
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex items-center gap-3 text-xs mt-2 text-muted-foreground">
      {responseTime !== undefined && (
        <span className="flex items-center gap-1" title="Tempo de resposta">
          <Clock className="h-3 w-3" />
          {responseTime < 1000 
            ? `${responseTime}ms` 
            : `${(responseTime / 1000).toFixed(1)}s`
          }
        </span>
      )}
      <span className="flex items-center gap-1" title="Tokens estimados">
        <Hash className="h-3 w-3" />
        ~{estimatedTokens.toLocaleString()}
      </span>
      <span className="flex items-center gap-1" title="Contagem de palavras">
        <FileText className="h-3 w-3" />
        {wordCount.toLocaleString()} palavras
      </span>
    </div>
  );
}
