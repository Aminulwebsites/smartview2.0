import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit, Trash2, Package, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { FoodItem, insertFoodItemSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const foodFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(1, 'Price must be at least ₹1'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().min(1, 'Image is required'),
  isVeg: z.boolean(),
  prepTime: z.string().min(1, 'Prep time is required'),
  rating: z.string().min(1, 'Rating is required'),
  available: z.boolean(),
});

type FoodForm = z.infer<typeof foodFormSchema>;

export default function FoodManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FoodForm>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      isVeg: true,
      prepTime: '15-20 mins',
      rating: '4.0',
      available: true,
    },
  });

  const { data: foodItems = [], isLoading } = useQuery<FoodItem[]>({
    queryKey: ['/api/foods'],
  });

  const createFoodMutation = useMutation({
    mutationFn: async (foodData: FoodForm) => {
      console.log('Creating food with data:', foodData);
      return await apiRequest('POST', '/api/admin/menu-items', foodData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/foods'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Food item created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Create food error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create food item",
        variant: "destructive",
      });
    }
  });

  const updateFoodMutation = useMutation({
    mutationFn: async ({ id, foodData }: { id: string; foodData: Partial<FoodForm> }) => {
      return await apiRequest('PATCH', `/api/admin/menu-items/${id}`, foodData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/foods'] });
      setIsDialogOpen(false);
      setEditingFood(null);
      form.reset();
      toast({
        title: "Success",
        description: "Food item updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update food item",
        variant: "destructive",
      });
    }
  });

  const deleteFoodMutation = useMutation({
    mutationFn: async (foodId: string) => {
      return await apiRequest('DELETE', `/api/admin/menu-items/${foodId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/foods'] });
      toast({
        title: "Success",
        description: "Food item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete food item",
        variant: "destructive",
      });
    }
  });

  const categories = Array.from(new Set(foodItems.map(item => item.category)));
  const filteredFoodItems = foodItems.filter(item => {
    const matchesSearch = 
      item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.price.toString().includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (data: FoodForm) => {
    console.log('Form data submitted:', data);
    
    // Validate form manually
    const result = foodFormSchema.safeParse(data);
    if (!result.success) {
      console.error('Form validation errors:', result.error);
      toast({
        title: "Validation Error",
        description: result.error.errors[0]?.message || "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Process the data to match server expectations
    const processedData = {
      ...data,
      price: Number(data.price),
      rating: data.rating.toString(), // Ensure rating is string for decimal field
      isVeg: Boolean(data.isVeg),
      available: Boolean(data.available),
    };
    
    console.log('Processed data:', processedData);
    
    if (editingFood) {
      updateFoodMutation.mutate({ id: editingFood.id, foodData: processedData });
    } else {
      createFoodMutation.mutate(processedData);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (food: FoodItem) => {
    setEditingFood(food);
    setImagePreview(food.image);
    
    // Reset form with food data, ensuring boolean values are properly set
    setTimeout(() => {
      form.reset({
        name: food.name,
        description: food.description,
        price: food.price,
        category: food.category,
        image: food.image,
        isVeg: Boolean(food.isVeg),
        prepTime: food.prepTime || '15-20 mins',
        rating: food.rating || '4.0',
        available: Boolean(food.available),
      });
    }, 0);
    
    setIsDialogOpen(true);
  };

  const handleDelete = (foodId: string) => {
    deleteFoodMutation.mutate(foodId);
  };

  const resetForm = () => {
    setEditingFood(null);
    setImageFile(null);
    setImagePreview('https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300');
    form.reset({
      name: '',
      description: '',
      price: 0,
      category: '',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      isVeg: true,
      prepTime: '15-20 mins',
      rating: '4.0',
      available: true,
    });
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading food items...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, category, description, or price..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Food Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 font-semibold text-lg">
                {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Category</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Main Course, Dessert" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Price (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prepTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Prep Time</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="15-20 mins" />
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
                      <FormLabel className="text-gray-700 font-medium">Food Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {/* Image Preview */}
                          <div className="flex items-center space-x-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                              {imagePreview ? (
                                <img 
                                  src={imagePreview} 
                                  alt="Food preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Label htmlFor="food-image" className="cursor-pointer">
                                <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors border border-gray-300">
                                  <Upload className="h-4 w-4" />
                                  <span className="text-sm">
                                    {imagePreview ? 'Change Image' : 'Upload Image'}
                                  </span>
                                </div>
                                <Input
                                  id="food-image"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="hidden"
                                />
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="isVeg"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row items-center justify-between rounded-lg border-2 p-4 bg-gray-50 transition-colors">
                          <div className="space-y-1">
                            <FormLabel className="text-gray-900 font-semibold text-base">
                              Vegetarian {field.value ? '🟢' : '🔴'}
                            </FormLabel>
                            <p className="text-sm text-gray-600">
                              {field.value ? 'This is a vegetarian item' : 'Mark as vegetarian'}
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={Boolean(field.value)}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-200 scale-110"
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="available"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row items-center justify-between rounded-lg border-2 p-4 bg-gray-50 transition-colors">
                          <div className="space-y-1">
                            <FormLabel className="text-gray-900 font-semibold text-base">
                              Available {field.value ? '✅' : '❌'}
                            </FormLabel>
                            <p className="text-sm text-gray-600">
                              {field.value ? 'Item is available for order' : 'Mark as available'}
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={Boolean(field.value)}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300 scale-110"
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />

                </div>
                
                {/* Rating Field */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Rating</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="4.5" className="max-w-xs" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createFoodMutation.isPending || updateFoodMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {editingFood ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Food Items List */}
      <div className="grid gap-4">
        {filteredFoodItems.map(food => (
          <Card key={food.id}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={food.image} 
                    alt={food.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTE2IDEySDhIMTZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{food.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{food.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={food.isVeg ? 'default' : 'secondary'}
                          className={food.isVeg 
                            ? 'bg-green-100 text-green-800 border-green-200 font-bold px-3 py-1' 
                            : 'bg-red-100 text-red-800 border-red-200 font-bold px-3 py-1'
                          }
                        >
                          {food.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className="bg-gray-100 text-gray-800 border-gray-300 font-semibold px-3 py-1"
                        >
                          {food.category}
                        </Badge>
                        <Badge 
                          variant={food.available ? 'default' : 'destructive'}
                          className={food.available 
                            ? 'bg-blue-100 text-blue-800 border-blue-200 font-bold px-3 py-1' 
                            : 'bg-red-100 text-red-800 border-red-200 font-bold px-3 py-1'
                          }
                        >
                          {food.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>₹{food.price}</span>
                        <span>⭐ {food.rating}</span>
                        <span>🕒 {food.prepTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(food)}
                        title="Edit food item"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            title="Delete food item"
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border border-gray-200 shadow-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-red-500" />
                              Delete Food Item
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <strong>{food.name}</strong>? 
                              This action cannot be undone and will permanently remove the food item from the menu.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(food.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete Food Item
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredFoodItems.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No food items found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}