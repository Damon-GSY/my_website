export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
          <div
            className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-indigo-400"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
