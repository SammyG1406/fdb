import Sidebar from '../components/Sidebar';
import OnboardingRedirect from '../components/OnboardingRedirect';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <OnboardingRedirect />
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
