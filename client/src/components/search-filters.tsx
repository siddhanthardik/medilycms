import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";

interface SearchFiltersProps {
  filters: {
    specialty?: string;
    location?: string;
    type?: string;
    minDuration?: number;
    maxDuration?: number;
    isFree?: boolean;
    search?: string;
  };
  onFilterChange: (filters: any) => void;
  specialties: Array<{ id: string; name: string }>;
}

export default function SearchFilters({ filters, onFilterChange, specialties }: SearchFiltersProps) {
  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      specialty: "",
      location: "",
      type: "",
      minDuration: undefined,
      maxDuration: undefined,
      isFree: undefined,
      search: "",
    });
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <Filter className="mr-2 h-5 w-5 inline text-primary" />
          Filters
        </h3>
        
        {/* Specialty Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Specialty</h4>
          <Select
            value={filters.specialty || "all"}
            onValueChange={(value) => handleFilterChange("specialty", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Program Type */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Program Type</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="observership"
                checked={filters.type === "observership"}
                onCheckedChange={(checked) => 
                  handleFilterChange("type", checked ? "observership" : "")
                }
              />
              <label htmlFor="observership" className="text-sm text-gray-700">
                Observership
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hands_on"
                checked={filters.type === "hands_on"}
                onCheckedChange={(checked) => 
                  handleFilterChange("type", checked ? "hands_on" : "")
                }
              />
              <label htmlFor="hands_on" className="text-sm text-gray-700">
                Hands-on Training
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fellowship"
                checked={filters.type === "fellowship"}
                onCheckedChange={(checked) => 
                  handleFilterChange("type", checked ? "fellowship" : "")
                }
              />
              <label htmlFor="fellowship" className="text-sm text-gray-700">
                Fellowship
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clerkship"
                checked={filters.type === "clerkship"}
                onCheckedChange={(checked) => 
                  handleFilterChange("type", checked ? "clerkship" : "")
                }
              />
              <label htmlFor="clerkship" className="text-sm text-gray-700">
                Clerkship
              </label>
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Cost</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="free"
                checked={filters.isFree === true}
                onCheckedChange={(checked) => 
                  handleFilterChange("isFree", checked ? true : undefined)
                }
              />
              <label htmlFor="free" className="text-sm text-gray-700">
                Free Programs
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paid"
                checked={filters.isFree === false}
                onCheckedChange={(checked) => 
                  handleFilterChange("isFree", checked ? false : undefined)
                }
              />
              <label htmlFor="paid" className="text-sm text-gray-700">
                Paid Programs
              </label>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Duration (weeks)</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Minimum</label>
              <Select
                value={filters.minDuration?.toString() || "any"}
                onValueChange={(value) => 
                  handleFilterChange("minDuration", value === "any" ? undefined : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Min weeks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1 week</SelectItem>
                  <SelectItem value="2">2 weeks</SelectItem>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Maximum</label>
              <Select
                value={filters.maxDuration?.toString() || "any"}
                onValueChange={(value) => 
                  handleFilterChange("maxDuration", value === "any" ? undefined : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Max weeks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="2">2 weeks</SelectItem>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                  <SelectItem value="24">24 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
}
