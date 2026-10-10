import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, GraduationCap, Users, LogIn, BookOpen, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signUpSchema = loginSchema.extend({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
  rollNumber: z.string().optional(),
});

const Login = () => {
  const { role } = useParams<{ role: UserRole }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuthContext();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isTeacher = role === 'teacher';
  const Icon = isTeacher ? GraduationCap : Users;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validate signup data
        const validation = signUpSchema.safeParse({ email, password, name, rollNumber });
        if (!validation.success) {
          toast({
            title: 'Validation Error',
            description: validation.error.errors[0].message,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(
          email, 
          password, 
          name, 
          role as UserRole,
          isTeacher ? undefined : rollNumber
        );

        if (error) {
          let message = error.message;
          if (error.message.includes('already registered')) {
            message = 'This email is already registered. Please sign in instead.';
          }
          toast({
            title: 'Sign Up Failed',
            description: message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account Created!',
            description: 'You have been signed up successfully.',
          });
          navigate(isTeacher ? '/teacher/dashboard' : '/student/dashboard');
        }
      } else {
        // Validate login data
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          toast({
            title: 'Validation Error',
            description: validation.error.errors[0].message,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(email, password);

        if (error) {
          toast({
            title: 'Login Failed',
            description: 'Invalid email or password. Please try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: `Successfully logged in`,
          });
          navigate(isTeacher ? '/teacher/dashboard' : '/student/dashboard');
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Decorative */}
      <div className={`hidden lg:flex lg:w-1/2 ${isTeacher ? 'gradient-bg' : 'bg-accent'} relative overflow-hidden`}>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <div className="p-4 bg-primary-foreground/20 rounded-3xl backdrop-blur-sm mb-6 animate-fade-in">
            <Icon className="w-16 h-16 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4 animate-slide-up">
            {isTeacher ? 'Teacher Portal' : 'Student Portal'}
          </h2>
          <p className="text-primary-foreground/80 max-w-md animate-slide-up stagger-1">
            {isTeacher
              ? 'Manage attendance, communicate with students, and streamline your teaching workflow.'
              : 'Track your attendance, view schedules, and stay connected with your educators.'}
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-4 text-left animate-fade-in stagger-2">
            {isTeacher ? (
              <>
                <div className="glass-effect p-4 rounded-xl">
                  <p className="text-primary-foreground font-medium">60+</p>
                  <p className="text-primary-foreground/70 text-sm">Students</p>
                </div>
                <div className="glass-effect p-4 rounded-xl">
                  <p className="text-primary-foreground font-medium">5</p>
                  <p className="text-primary-foreground/70 text-sm">Subjects</p>
                </div>
              </>
            ) : (
              <>
                <div className="glass-effect p-4 rounded-xl">
                  <p className="text-primary-foreground font-medium">Live</p>
                  <p className="text-primary-foreground/70 text-sm">Attendance</p>
                </div>
                <div className="glass-effect p-4 rounded-xl">
                  <p className="text-primary-foreground font-medium">Monthly</p>
                  <p className="text-primary-foreground/70 text-sm">Reports</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to role selection
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${isTeacher ? 'bg-primary/10' : 'bg-accent/10'}`}>
              <BookOpen className={`w-6 h-6 ${isTeacher ? 'text-primary' : 'text-accent'}`} />
            </div>
            <span className="text-muted-foreground font-medium">Smart Attendance</span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isTeacher ? 'Teacher' : 'Student'} {isSignUp ? 'Sign Up' : 'Sign In'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp ? 'Create your account to get started' : 'Enter your credentials to access the portal'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder={isTeacher ? 'teacher@example.com' : 'student@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            {isSignUp && !isTeacher && (
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  type="text"
                  placeholder="e.g., 242P1A0501"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant={isTeacher ? 'gradient' : 'accent'}
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span className={`font-medium ${isTeacher ? 'text-primary' : 'text-accent'}`}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
