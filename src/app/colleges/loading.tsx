export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="h-8 w-48 mx-auto bg-white/20 rounded-full animate-pulse mb-6"></div>
          <div className="h-12 w-96 mx-auto bg-white/30 rounded-xl animate-pulse mb-4"></div>
          <div className="h-6 w-64 mx-auto bg-white/20 rounded-lg animate-pulse"></div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="h-32 bg-muted/50 rounded-xl"></div>
              <div className="h-6 bg-muted/50 rounded-lg w-3/4"></div>
              <div className="h-4 bg-muted/50 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
