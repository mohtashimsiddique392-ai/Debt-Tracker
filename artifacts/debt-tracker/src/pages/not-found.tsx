import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <p className="text-6xl font-serif text-primary mb-4">404</p>
        <h1 className="text-2xl font-serif text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist.
        </p>
        <Link href="/">
          <Button>Back to Ledger</Button>
        </Link>
      </div>
    </div>
  );
}
