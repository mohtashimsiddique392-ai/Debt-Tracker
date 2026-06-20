import * as React from "react";
import { Link } from "wouter";
import type { Debt } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Phone, CheckCircle2, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DebtCardProps {
  debt: Debt;
  onDelete: (id: number) => void;
  onSettle: (id: number) => void;
  onUnsettle: (id: number) => void;
  isDeleting?: boolean;
  isSettling?: boolean;
}

export function DebtCard({ debt, onDelete, onSettle, onUnsettle, isSettling }: DebtCardProps) {
  const isSettled = Boolean(debt.settledAt);

  return (
    <div className={`group relative bg-card rounded-xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col gap-4 ${isSettled ? "opacity-60 border-muted" : "hover:border-primary/20"}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-serif text-xl text-foreground font-medium">
              {debt.personName}
            </h3>
            {isSettled && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Settled
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={debt.date}>{formatDate(debt.date)}</time>
            {debt.mobileNumber && (
              <span className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded-md">
                <Phone className="h-3 w-3" />
                {debt.mobileNumber}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-serif font-medium tracking-tight ${isSettled ? "text-muted-foreground line-through" : "text-primary"}`}>
            {formatCurrency(debt.amount)}
          </div>
          {isSettled && debt.settledAt && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Settled {formatDate(debt.settledAt.split("T")[0])}
            </p>
          )}
        </div>
      </div>

      {debt.notes && (
        <p className="text-sm text-foreground/80 leading-relaxed max-w-xl">
          {debt.notes}
        </p>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        {!isSettled && (
          <Link href={`/edit/${debt.id}`}>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
              <Edit2 className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          </Link>
        )}

        {isSettled ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => onUnsettle(debt.id)}
            disabled={isSettling}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Mark outstanding
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
            onClick={() => onSettle(debt.id)}
            disabled={isSettling}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Mark settled
          </Button>
        )}

        <div className="flex-1" />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete entry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this record for {debt.personName}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(debt.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
