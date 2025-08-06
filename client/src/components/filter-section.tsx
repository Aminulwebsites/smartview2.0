import { Filter, DollarSign, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterSectionProps {
  onFilterChange?: (filters: any) => void;
}

export default function FilterSection({ onFilterChange }: FilterSectionProps) {
  return (
    <section className="bg-light-gray py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-gray-700 font-medium">Filter by:</span>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Cuisine
          </Button>
          <Button variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Price Range
          </Button>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Rating 4.0+
          </Button>
          <Button variant="outline" size="sm">
            <Truck className="h-4 w-4 mr-2" />
            Fast Delivery
          </Button>
        </div>
      </div>
    </section>
  );
}
