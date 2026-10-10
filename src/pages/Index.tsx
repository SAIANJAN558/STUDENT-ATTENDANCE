import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import RoleSelection from './RoleSelection';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    }
  }, [isAuthenticated, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <RoleSelection />;
};

export default Index;
