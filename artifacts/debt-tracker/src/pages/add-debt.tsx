import * as React from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateDebt, getListDebtsQueryKey, getGetDebtSummaryQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { DebtForm, DebtFormValues } from "@/components/debt-form";
import { useToast } from "@/hooks/use-toast";

export default function AddDebt() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createDebt = useCreateDebt();

  const handleSubmit = (values: DebtFormValues) => {
    createDebt.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Entry added successfully" });
        queryClient.invalidateQueries({ queryKey: getListDebtsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDebtSummaryQueryKey() });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Failed to add entry", variant: "destructive" });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto w-full">
        <DebtForm 
          onSubmit={handleSubmit} 
          isSubmitting={createDebt.isPending} 
        />
      </div>
    </Layout>
  );
}