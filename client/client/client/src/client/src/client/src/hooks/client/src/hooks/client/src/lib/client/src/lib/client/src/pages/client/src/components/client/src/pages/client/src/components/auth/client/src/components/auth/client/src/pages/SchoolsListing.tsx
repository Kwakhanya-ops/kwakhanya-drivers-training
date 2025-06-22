import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Phone, Mail, Star, ArrowLeft, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const SchoolsListing = () => {
  const [, navigate] = useLocation();
  const [searchLocation, setSearchLocation] = useState("");
  const [searchService, setSearchService] = useState("");

  // Get search params from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const location = urlParams.get("location") || "";
    const service = urlParams.get("service") || "";
    
    setSearchLocation(location);
    setSearchService(service);
  }, []);

  const { data: schools, isLoading, error } = useQuery({
    queryKey: ["/api/schools", searchLocation, searchService],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchLocation) params.set("location", searchLocation);
      if (searchService) params.set("service", searchService);
      
      const response = await apiRequest("GET", `/api/schools?${params.toString()}`);
      return response.json();
    },
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set("location", searchLocation);
    if (searchService) params.set("service", searchService);
    
    navigate(`/schools?${params.toString()}`);
  };

  const handleBookSchool = (schoolId: number) => {
    navigate(`/booking/${schoolId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Searching for driving schools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading schools. Please try again.</p>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <h1 className="text-2xl font-bold text-gray-900">Driving Schools</h1>
            
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Refine Your Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  placeholder="Enter city or area"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <Input
                  placeholder="e.g. Basic lessons, Highway driving"
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Update Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {schools?.length || 0} driving schools found
            {searchLocation && (
              <span className="text-gray-600 font-normal"> in {searchLocation}</span>
            )}
          </h2>
        </div>

        {/* Schools Grid */}
        {schools && schools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school: any) => (
              <Card key={school.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{school.schoolName}</CardTitle>
                      <CardDescription className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {school.location}
                      </CardDescription>
                    </div>
                    {school.verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {school.description || "Professional driving instruction with experienced instructors."}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {school.contactPhone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {school.contactEmail}
                    </div>
                  </div>

                  {/* Services */}
                  {school.services && school.services.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {school.services.slice(0, 3).map((service: any) => (
                          <Badge key={service.id} variant="outline" className="text-xs">
                            R{service.price}
                          </Badge>
                        ))}
                        {school.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{school.services.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => handleBookSchool(school.id)}
                  >
                    View Details & Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No schools found</h3>
                <p>Try adjusting your search criteria or location.</p>
              </div>
              <Button onClick={() => navigate("/")} variant="outline">
                Start New Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SchoolsListing;
