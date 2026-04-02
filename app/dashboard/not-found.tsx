"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {/* Decorative Icon */}
      <div className="mb-4 rounded-full bg-muted p-6">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>

      {/* Large Background Text */}
      <div className="relative">
        <span className="absolute inset-0 -top-8 flex items-center justify-center text-9xl font-extrabold opacity-[0.03] select-none">
          404
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Page not found</h1>
      </div>

      <p className="mt-4 text-base text-muted-foreground max-w-100">
        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Button size="lg" className="px-8" onClick={() => window.location.href = '/dashboard'}>
          <Home className="mr-2 h-4 w-4" />
          Back to dashboard
        </Button>

        <Button variant="outline" size="lg" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        If you think this is a mistake, please{" "}
        <Link href="/support" className="underline underline-offset-4 hover:text-primary">
          contact support
        </Link>.
      </p>
    </div>
  );
}
