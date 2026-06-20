import * as React from "react";
import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-medium tracking-tight text-foreground hover:opacity-80 transition-opacity">
            Ledger.
          </Link>
        </div>
      </header>
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-8 flex flex-col">
        {children}
      </main>
    </div>
  );
}