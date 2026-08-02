import { SignUp } from '@clerk/nextjs';
import Logo from '../../components/Logo';

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center px-4">
      <div className="relative z-10 flex flex-col items-center gap-6">
        <Logo size="lg" showSubtitle />
        <SignUp
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
