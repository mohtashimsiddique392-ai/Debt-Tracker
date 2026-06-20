import * as React from "react";
import { Link } from "wouter";
import { Debt } from "@workspace/api-client-react/src/generated/api.schemas";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Phone } from "lucide-react";
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
  isDeleting?: boolean;
}

export function DebtCard({ debt, onDelete, isDeleting }: DebtCardProps) {
  return (
    <div className="group relative bg-card rounded-xl border p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-xl text-foreground font-medium mb-1">
            {debt.personName}
          </h3>
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
          <div className="text-2xl font-serif text-primary font-medium tracking-tight">
            {formatCurrency(debt.amount)}
          </div>
        </div>
      </div>
      
      {debt.notes && (
        <p className="text-sm text-foreground/80 leading-relaxed max-w-xl">
          {debt.notes}
        </p>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <Link href={`/edit/${debt.id}`}>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
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