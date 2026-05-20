import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border/40 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-cyan-500/10">
          <span className="text-5xl font-bold bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            404
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button variant="outline" className="gap-2 rounded-full">
              <ArrowLeft className="h-4 w-4" />
              Back to homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
