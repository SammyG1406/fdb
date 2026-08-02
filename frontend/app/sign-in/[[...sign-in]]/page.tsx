import { SignIn } from '@clerk/nextjs';
import Logo from '../../components/Logo';
import Helix from '../../components/Helix';

export default function SignInPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center px-4">
      <Helix className="pointer-events-none absolute -left-24 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block" />
      <Helix className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block" strands={10} />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <Logo size="lg" showSubtitle />
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#8b5cf6',
              borderRadius: '1rem',
            },
          }}
        />
      </div>
    </div>
  );
}
