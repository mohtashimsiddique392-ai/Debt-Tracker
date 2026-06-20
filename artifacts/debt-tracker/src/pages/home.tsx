import * as React from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListDebts,
  useGetDebtSummary,
  useDeleteDebt,
  useSettleDebt,
  useUnsettleDebt,
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

type SettledFilter = "all" | "yes" | "no";

export default function Home() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [settledFilter, setSettledFilter] = React.useState<SettledFilter>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: summary, isLoading: isLoadingSummary } = useGetDebtSummary({
    query: { queryKey: getGetDebtSummaryQueryKey() },
  });

  const queryParams = {
    search: debouncedSearch || undefined,
    sortOrder,
    settled: settledFilter === "all" ? undefined : settledFilter,
  };

  const { data: debts, isLoading: isLoadingDebts } = useListDebts(queryParams, {
    query: { queryKey: getListDebtsQueryKey(queryParams) },
  });

  const deleteDebt = useDeleteDebt();
  const settleDebt = useSettleDebt();
  const unsettleDebt = useUnsettleDebt();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListDebtsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDebtSummaryQueryKey() });
  };

  const handleDelete = (id: number) => {
    deleteDebt.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Entry deleted" });
        invalidateAll();
      },
      onError: () => {
        toast({ title: "Failed to delete entry", variant: "destructive" });
      },
    });
  };

  const handleSettle = (id: number) => {
    settleDebt.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Marked as settled" });
        invalidateAll();
      },
      onError: () => {
        toast({ title: "Failed to mark as settled", variant: "destructive" });
      },
    });
  };

  const handleUnsettle = (id: number) => {
    unsettleDebt.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Marked as outstanding" });
        invalidateAll();
      },
      onError: () => {
        toast({ title: "Failed to update entry", variant: "destructive" });
      },
    });
  };

  const filterLabels: Record<SettledFilter, string> = {
    all: "All",
    no: "Outstanding",
    yes: "Settled",
  };

  return (
    <Layout>
      {/* Summary Section */}
      <div className="mb-8 p-6 rounded-2xl bg-primary text-primary-foreground shadow-sm">
        {isLoadingSummary ? (
          <Skeleton className="h-12 w-48 bg-primary-foreground/20" />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
            <div>
              <div className="opacity-80 text-xs font-medium tracking-widest uppercase mb-1">
                Outstanding
              </div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-serif tracking-tight">
                  {formatCurrency(summary?.outstandingAmount ?? 0)}
                </h2>
                <span className="opacity-80 text-sm">
                  {summary?.outstandingCount ?? 0} {summary?.outstandingCount === 1 ? "entry" : "entries"}
                </span>
              </div>
            </div>
            {(summary?.settledCount ?? 0) > 0 && (
              <div className="opacity-70 text-sm">
                <span className="font-medium">{summary?.settledCount}</span> settled
                {" · "}
                <span className="font-medium">{formatCurrency(summary?.totalAmount ?? 0)}</span> total
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Settled filter tabs */}
          <div className="flex rounded-lg border bg-card shadow-sm overflow-hidden">
            {(["all", "no", "yes"] as SettledFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setSettledFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  settledFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className="shadow-sm bg-card"
          >
            {sortOrder === "desc" ? (
              <><ArrowDownWideNarrow className="mr-2 h-4 w-4" />Newest</>
            ) : (
              <><ArrowUpWideNarrow className="mr-2 h-4 w-4" />Oldest</>
            )}
          </Button>

          <Link href="/add">
            <Button className="shadow-sm">
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
                : settledFilter === "yes"
                  ? "No settled entries yet."
                  : settledFilter === "no"
                    ? "No outstanding entries. Everything is settled."
                    : "Your ledger is empty. Add a new entry to start tracking."}
            </p>
            {!debouncedSearch && settledFilter !== "yes" && (
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
            {debts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onDelete={handleDelete}
                onSettle={handleSettle}
                onUnsettle={handleUnsettle}
                isDeleting={deleteDebt.isPending}
                isSettling={settleDebt.isPending || unsettleDebt.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
