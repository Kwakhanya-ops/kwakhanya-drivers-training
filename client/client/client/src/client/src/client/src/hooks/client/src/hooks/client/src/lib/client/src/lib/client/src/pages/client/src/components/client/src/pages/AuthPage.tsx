import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

const AuthPage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('login');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'school') {
        setLocation('/school-dashboard');
      } else if (user.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/bookings');
      }
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
        
        {/* Hero Section */}
        <div className="flex flex-col justify-center p-8 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start mb-6">
            <Car className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Kwakhanya</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Driving Journey Today
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students who have learned to drive safely with our certified instructors across South Africa.
          </p>
          
          <div className="space-y-4 text-gray-600">
            <div className="flex items-center justify-center lg:justify-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>Certified driving instructors</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>Flexible scheduling options</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>Progress tracking and assessments</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>Schools nationwide</span>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-6">
                  <LoginForm />
                </TabsContent>
                
                <TabsContent value="register" className="mt-6">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
