export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      
      {/* MVP: No auth, so no sign out. Shows version badge instead */}
      <span className="px-3 py-1 text-xs font-medium text-amber-400 bg-amber-400/10 rounded-full border border-amber-400/20">
        MVP v0.1
      </span>
    </header>
  );
}
