import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";

const formSchema = z.object({
  personName: z.string().min(1, "Name is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  mobileNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type DebtFormValues = z.infer<typeof formSchema>;

interface DebtFormProps {
  defaultValues?: Partial<DebtFormValues>;
  onSubmit: (values: DebtFormValues) => void;
  isSubmitting?: boolean;
}

export function DebtForm({ defaultValues, onSubmit, isSubmitting }: DebtFormProps) {
  const [, setLocation] = useLocation();
  const form = useForm<DebtFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personName: defaultValues?.personName || "",
      amount: defaultValues?.amount || 0,
      date: defaultValues?.date || new Date().toISOString().split("T")[0],
      mobileNumber: defaultValues?.mobileNumber || "",
      notes: defaultValues?.notes || "",
    },
  });

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => setLocation("/")}
        className="px-0 hover:bg-transparent hover:text-primary -ml-2 text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Ledger
      </Button>

      <div className="space-y-1 pb-4">
        <h1 className="text-3xl font-serif text-foreground">
          {defaultValues ? "Edit entry" : "New entry"}
        </h1>
        <p className="text-muted-foreground">
          Record a new balance. Keep it simple.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 bg-card border rounded-xl p-6 shadow-sm">
            <FormField
              control={form.control}
              name="personName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Who?</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Jane Doe" className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" step="0.01" className="pl-7 bg-background" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Contact <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Notes <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What was this for?" 
                      className="resize-none bg-background min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto font-medium">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}