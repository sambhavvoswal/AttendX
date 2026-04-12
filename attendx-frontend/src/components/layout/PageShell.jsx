import { BottomNav } from './BottomNav.jsx';
import { Sidebar } from './Sidebar.jsx';

export function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="mx-auto flex w-full max-w-6xl gap-0 lg:gap-6">
        <aside className="hidden lg:block lg:w-[240px] lg:shrink-0">
          <Sidebar />
        </aside>

        <main className="w-full px-4 pb-20 pt-6 lg:pb-8 lg:pt-8">
          {children}
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

