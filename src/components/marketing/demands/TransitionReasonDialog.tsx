/**
 * Transition Reason Dialog
 *
 * Modal for capturing the reason when a demand status transition requires one.
 * Provides clear context about why the reason is needed.
 */

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getTransitionReasonPrompt } from "@/domain/demands";
import type { DemandStatus } from "@/domain/demands";

interface TransitionReasonDialogProps {
  open: boolean;
  from: DemandStatus;
  to: DemandStatus;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TransitionReasonDialog({
  open,
  from,
  to,
  onConfirm,
  onCancel,
  isLoading = false,
}: TransitionReasonDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason("");
    }
  };

  const handleCancel = () => {
    setReason("");
    onCancel();
  };

  const isValid = reason.trim().length > 0;
  const prompt = getTransitionReasonPrompt(from, to);

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Motivo da Alteração</AlertDialogTitle>
          <AlertDialogDescription>
            Você está realizando uma alteração que requer explicação. Por favor,
            descreva o motivo:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-3">
          <Label htmlFor="reason-textarea" className="text-sm font-medium">
            {prompt}
          </Label>
          <Textarea
            id="reason-textarea"
            placeholder="Digite o motivo aqui..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
            className="min-h-[100px]"
          />
          <div className="text-xs text-muted-foreground">
            Mínimo 5 caracteres. Este motivo será registrado no histórico da demanda.
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? "Salvando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
