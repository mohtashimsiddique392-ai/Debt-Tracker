import * as React from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListDebts, 
  useGetDebtSummary, 
  useDeleteDebt, 
  getListDebtsQueryKey, 
  getGetDebtSummaryQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { DebtCard } from "@/components/debt-card";
import { formatCurrency } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: summary, isLoading: isLoadingSummary } = useGetDebtSummary({
    query: { queryKey: getGetDebtSummaryQueryKey() }
  });

  const { data: debts, isLoading: isLoadingDebts } = useListDebts(
    { search: debouncedSearch || undefined, sortOrder },
    { query: { queryKey: getListDebtsQueryKey({ search: debouncedSearch || undefined, sortOrder }) } }
  );

  const deleteDebt = useDeleteDebt();

  const handleDelete = (id: number) => {
    deleteDebt.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Entry deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListDebtsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDebtSummaryQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to delete entry", variant: "destructive" });
      }
    });
  };

  return (
    <Layout>
      {/* Summary Section */}
      <div className="mb-10 p-6 rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <div className="opacity-80 text-sm font-medium tracking-wide uppercase mb-1">
          Total Outstanding
        </div>
        {isLoadingSummary ? (
          <Skeleton className="h-12 w-48 bg-primary-foreground/20" />
        ) : (
          <div className="flex items-baseline gap-3">
            <h2 className="text-5xl font-serif tracking-tight">
              {formatCurrency(summary?.totalAmount || 0)}
            </h2>
            <span className="opacity-80 text-sm">
              across {summary?.totalCount || 0} entries
            </span>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
            className="flex-1 sm:flex-none shadow-sm bg-card"
          >
            {sortOrder === "desc" ? (
              <><ArrowDownWideNarrow className="mr-2 h-4 w-4" /> Newest</>
            ) : (
              <><ArrowUpWideNarrow className="mr-2 h-4 w-4" /> Oldest</>
            )}
          </Button>
          <Link href="/add" className="flex-1 sm:flex-none">
            <Button className="w-full shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Debt List */}
      <div className="space-y-4">
        {isLoadingDebts ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border p-5 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))
        ) : !debts || debts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-card border border-dashed rounded-xl">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground opacity-50" />
            </div>
            <h3 className="font-serif text-xl text-foreground mb-2">No entries found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {debouncedSearch 
                ? `No results matching "${debouncedSearch}".`
                : "Your ledger is clean. Add a new entry to start tracking."}
            </p>
            {!debouncedSearch && (
              <Link href="/add">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Entry
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {debts.map(debt => (
              <DebtCard 
                key={debt.id} 
                debt={debt} 
                onDelete={handleDelete}
                isDeleting={deleteDebt.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}