export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative">
        {/* Animated gradient circle */}
        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 animate-spin">
          <div className="h-full w-full rounded-full border-8 border-t-transparent border-background"></div>
        </div>
        
        {/* Pulsing glow effect */}
        <div className="absolute inset-0 h-20 w-20 rounded-full bg-gradient-to-r from-purple-600/50 via-violet-600/50 to-indigo-600/50 blur-xl animate-pulse"></div>
        
        {/* Logo or text */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className="text-gradient font-semibold text-lg tracking-wide">Loading...</p>
        </div>
      </div>
    </div>
  );
}
