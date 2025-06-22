import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";
import { MapPin, Search } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const searchFormSchema = z.object({
  location: z.string().min(2, "Location must be at least 2 characters"),
  serviceType: z.string().optional(),
});

type FormValues = {
  location: string;
  serviceType?: string;
};

const SearchForm = () => {
  const [, navigate] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      location: "",
      serviceType: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    const queryParams = new URLSearchParams();
    queryParams.set("location", data.location);
    if (data.serviceType && data.serviceType !== "") {
      queryParams.set("service", data.serviceType);
    }
    
    navigate(`/schools?${queryParams.toString()}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-gray-700">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Johannesburg, Cape Town, Durban" 
                    {...field} 
                    className="h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Service Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="basic">Basic Driving Lessons</SelectItem>
                    <SelectItem value="advanced">Advanced Driving</SelectItem>
                    <SelectItem value="highway">Highway Driving</SelectItem>
                    <SelectItem value="parking">Parking Practice</SelectItem>
                    <SelectItem value="defensive">Defensive Driving</SelectItem>
                    <SelectItem value="license">License Test Prep</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" size="lg" className="w-full md:w-auto">
          <Search className="h-4 w-4 mr-2" />
          Search Driving Schools
        </Button>
      </form>
    </Form>
  );
};

export default SearchForm;
