import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, Award, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Kwakhanya Drivers Training
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Professional driving instruction across South Africa. 
            Learn to drive safely with certified instructors and modern vehicles.
          </p>
          <div className="space-x-4">
            <Link href="/search">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Find Driving Schools
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Kwakhanya?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We connect you with the best driving schools in your area, 
              making it easy to learn to drive safely and confidently.
            </p>
          </div>
          
          <div className="grid-responsive">
            <Card className="card-hover">
              <CardHeader>
                <Car className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Modern Vehicles</CardTitle>
                <CardDescription>
                  Learn with well-maintained, modern vehicles equipped with dual controls for your safety.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Certified Instructors</CardTitle>
                <CardDescription>
                  All our partner instructors are professionally certified and experienced in driver education.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Award className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>High Pass Rates</CardTitle>
                <CardDescription>
                  Our driving schools maintain excellent pass rates with comprehensive training programs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Flexible Scheduling</CardTitle>
                <CardDescription>
                  Book lessons at times that work for you with our easy online booking system.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have successfully learned to drive with our partner driving schools.
          </p>
          <Link href="/search">
            <Button size="lg" className="btn-primary">
              Find a Driving School Near You
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
