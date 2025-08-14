import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, Plus, Edit, Trash2, Star, Clock, IndianRupee } from 'lucide-react';
import { Restaurant, insertRestaurantSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const restaurantFormSchema = insertRestaurantSchema.extend({
  name: z.string().min(1, 'Name is required'),
  cuisine: z.string().min(1, 'Cuisine is required'),
  rating: z.string().min(1, 'Rating is required'),
  deliveryTime: z.string().min(1, 'Delivery time is required'),
  image: z.string().url('Invalid image URL'),
});

type RestaurantForm = z.infer<typeof restaurantFormSchema>;

export default function RestaurantManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<RestaurantForm>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: '',
      cuisine: '',
      rating: '4.0',
      deliveryTime: '30-40 mins',
      costForTwo: 250,
      deliveryFee: 0,
      image: '',
      description: '',
    },
  });

  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (restaurantData: RestaurantForm) => {
      return await apiRequest('/api/admin/restaurants', {
        method: 'POST',
        body: JSON.stringify(restaurantData),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Restaurant created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create restaurant",
        variant: "destructive",
      });
    }
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: async ({ id, restaurantData }: { id: string; restaurantData: Partial<RestaurantForm> }) => {
      return await apiRequest(`/api/admin/restaurants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(restaurantData),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants'] });
      setIsDialogOpen(false);
      setEditingRestaurant(null);
      form.reset();
      toast({
        title: "Success",
        description: "Restaurant updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update restaurant",
        variant: "destructive",
      });
    }
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: async (restaurantId: string) => {
      return await apiRequest(`/api/admin/restaurants/${restaurantId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants'] });
      toast({
        title: "Success",
        description: "Restaurant deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete restaurant",
        variant: "destructive",
      });
    }
  });

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (data: RestaurantForm) => {
    if (editingRestaurant) {
      updateRestaurantMutation.mutate({ id: editingRestaurant.id, restaurantData: data });
    } else {
      createRestaurantMutation.mutate(data);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    form.reset({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: restaurant.rating,
      deliveryTime: restaurant.deliveryTime,
      costForTwo: restaurant.costForTwo,
      deliveryFee: restaurant.deliveryFee,
      image: restaurant.image,
      description: restaurant.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (restaurantId: string) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      deleteRestaurantMutation.mutate(restaurantId);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingRestaurant(null);
    form.reset();
  };

  if (isLoading) {
    return <div className="p-8">Loading restaurants...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Italian, Chinese, Indian" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Time</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="30-40 mins" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="costForTwo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost for Two</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Fee</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRestaurantMutation.isPending || updateRestaurantMutation.isPending}>
                    {editingRestaurant ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Restaurants Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRestaurants.map(restaurant => (
          <Card key={restaurant.id} className="overflow-hidden">
            <div className="aspect-video">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                <div className="flex items-center text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {restaurant.rating}
                </div>
              </div>
              <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {restaurant.deliveryTime}
                  </span>
                  <span className="flex items-center text-gray-600">
                    <IndianRupee className="h-3 w-3 mr-1" />
                    ₹{restaurant.costForTwo} for two
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {restaurant.description}
                </p>
                <div className="text-sm">
                  <span className={`font-medium ${restaurant.deliveryFee === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {restaurant.deliveryFee === 0 ? 'Free Delivery' : `₹${restaurant.deliveryFee} Delivery Fee`}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(restaurant)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(restaurant.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRestaurants.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No restaurants found matching your search.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}