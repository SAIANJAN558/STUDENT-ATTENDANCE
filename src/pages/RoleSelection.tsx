import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary-foreground/20 rounded-2xl backdrop-blur-sm">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Smart Student Attendance
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md mx-auto">
            Streamlined attendance management for modern education
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 animate-slide-up stagger-1">
          {/* Teacher Card */}
          <button
            onClick={() => handleRoleSelect('teacher')}
            onMouseEnter={() => setHoveredRole('teacher')}
            onMouseLeave={() => setHoveredRole(null)}
            className={`group relative p-8 rounded-3xl transition-all duration-500 hover-lift cursor-pointer text-left ${
              hoveredRole === 'teacher'
                ? 'bg-card shadow-2xl scale-105'
                : 'bg-card/90 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl transition-all duration-300 ${
                hoveredRole === 'teacher' ? 'bg-primary' : 'bg-primary/10'
              }`}>
                <GraduationCap className={`w-8 h-8 transition-colors duration-300 ${
                  hoveredRole === 'teacher' ? 'text-primary-foreground' : 'text-primary'
                }`} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  I'm a Teacher
                </h2>
                <p className="text-muted-foreground mb-4">
                  Manage attendance, students, timetables, and send communications
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Mark & manage attendance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Add & update student records
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Create & share timetables
                  </li>
                </ul>
              </div>
            </div>
            <div className={`absolute bottom-6 right-6 p-3 rounded-full transition-all duration-300 ${
              hoveredRole === 'teacher' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Student Card */}
          <button
            onClick={() => handleRoleSelect('student')}
            onMouseEnter={() => setHoveredRole('student')}
            onMouseLeave={() => setHoveredRole(null)}
            className={`group relative p-8 rounded-3xl transition-all duration-500 hover-lift cursor-pointer text-left ${
              hoveredRole === 'student'
                ? 'bg-card shadow-2xl scale-105'
                : 'bg-card/90 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl transition-all duration-300 ${
                hoveredRole === 'student' ? 'bg-accent' : 'bg-accent/10'
              }`}>
                <Users className={`w-8 h-8 transition-colors duration-300 ${
                  hoveredRole === 'student' ? 'text-accent-foreground' : 'text-accent'
                }`} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  I'm a Student
                </h2>
                <p className="text-muted-foreground mb-4">
                  View your attendance, schedule, and messages from teachers
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Check attendance records
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    View monthly statistics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Access class timetable
                  </li>
                </ul>
              </div>
            </div>
            <div className={`absolute bottom-6 right-6 p-3 rounded-full transition-all duration-300 ${
              hoveredRole === 'student' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-foreground/60 mt-8 text-sm animate-fade-in stagger-3">
          CBIT Educational Portal • Secure & Efficient
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
