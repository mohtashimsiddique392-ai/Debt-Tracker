import * as React from "react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetDebt, 
  useUpdateDebt, 
  getGetDebtQueryKey, 
  getListDebtsQueryKey, 
  getGetDebtSummaryQueryKey 
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { DebtForm, DebtFormValues } from "@/components/debt-form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditDebt() {
  const { id } = useParams<{ id: string }>();
  const debtId = parseInt(id || "", 10);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: debt, isLoading, isError } = useGetDebt(debtId, { 
    query: { 
      enabled: !isNaN(debtId),
      queryKey: getGetDebtQueryKey(debtId) 
    } 
  });
  
  const updateDebt = useUpdateDebt();

  const handleSubmit = (values: DebtFormValues) => {
    if (isNaN(debtId)) return;
    
    updateDebt.mutate({ id: debtId, data: values }, {
      onSuccess: () => {
        toast({ title: "Entry updated successfully" });
        queryClient.invalidateQueries({ queryKey: getListDebtsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDebtSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDebtQueryKey(debtId) });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Failed to update entry", variant: "destructive" });
      }
    });
  };

  if (isError || isNaN(debtId)) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto w-full text-center py-16">
          <h2 className="text-2xl font-serif mb-4">Entry not found</h2>
          <Button onClick={() => setLocation("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ledger
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto w-full">
        {isLoading || !debt ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-32 mb-8" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <DebtForm 
            defaultValues={{
              personName: debt.personName,
              amount: debt.amount,
              date: debt.date,
              mobileNumber: debt.mobileNumber || "",
              notes: debt.notes || "",
            }}
            onSubmit={handleSubmit} 
            isSubmitting={updateDebt.isPending} 
          />
        )}
      </div>
    </Layout>
  );
}