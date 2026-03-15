import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LinkToContextProps {
  label: string;
  to: string;
  state?: Record<string, unknown>;
  className?: string;
}

export function LinkToContext({ label, to, state, className }: LinkToContextProps) {
  const navigate = useNavigate();
  return (
    <Button
      variant="outline"
      size="sm"
      className={`h-7 text-xs ${className || ""}`}
      onClick={() => navigate(to, { state })}
    >
      <ExternalLink className="h-3 w-3 mr-1" />
      {label}
    </Button>
  );
}
