'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/hooks/use-auth';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  Save,
  Send,
  X,
  Loader2,
  Upload,
  Tag,
  IndianRupee,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {useToast} from '@/hooks/use-toast';
import {supabase} from '@/lib/supabase/client';
import {Skeleton} from '@/components/ui/skeleton';
import {Switch} from '@/components/ui/switch';

const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category_id: z.string().uuid('Please select a category'),
  college_id: z.string().uuid('Please select a college').optional(),
  is_global: z.boolean().default(false),
  participation_type: z.enum(['individual', 'team', 'both']).default('individual'),
  team_size_min: z.string().optional(),
  team_size_max: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_date: z.string().min(1, 'End date is required'),
  end_time: z.string().min(1, 'End time is required'),
  location: z.string().min(3, 'Location is required'),
  venue_details: z.string().optional(),
  max_attendees: z.string().optional(),
  registration_deadline: z.string().optional(),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  tags: z.string().optional(),
  is_featured: z.boolean().default(false),
  // Pricing fields
  individual_price: z.string().optional(),
  team_base_price: z.string().optional(),
  price_per_member: z.string().optional(),
  has_custom_team_pricing: z.boolean().default(false),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const {user, profile, loading: authLoading} = useAuth();
  const router = useRouter();
  const {toast} = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      college_id: '',
      is_global: false,
      participation_type: 'individual',
      team_size_min: '1',
      team_size_max: '1',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      location: '',
      venue_details: '',
      max_attendees: '',
      registration_deadline: '',
      image_url: '',
      tags: '',
      is_featured: false,
      individual_price: '0',
      team_base_price: '0',
      price_per_member: '0',
      has_custom_team_pricing: false,
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'organizer')) {
      router.push('/');
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, collegesData] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('colleges').select('*').order('name'),
      ]);

      if (categoriesData.data) setCategories(categoriesData.data);
      if (collegesData.data) setColleges(collegesData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: EventFormValues, isDraft = false) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Combine date and time
      const startDateTime = new Date(`${values.start_date}T${values.start_time}`);
      const endDateTime = new Date(`${values.end_date}T${values.end_time}`);
      const registrationDeadline = values.registration_deadline
        ? new Date(values.registration_deadline)
        : null;

      // Parse tags
      const tagsArray = values.tags
        ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const eventData = {
        title: values.title,
        description: values.description,
        organizer_id: user.id,
        category_id: values.category_id,
        college_id: values.college_id || null,
        is_global: values.is_global,
        participation_type: values.participation_type,
        team_size_min: values.participation_type !== 'individual' && values.team_size_min
          ? parseInt(values.team_size_min)
          : 1,
        team_size_max: values.participation_type !== 'individual' && values.team_size_max
          ? parseInt(values.team_size_max)
          : 1,
        event_status: isDraft ? 'draft' : 'published',
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        location: values.location,
        venue_details: values.venue_details || null,
        image_url: values.image_url || null,
        max_attendees: values.max_attendees ? parseInt(values.max_attendees) : null,
        registration_deadline: registrationDeadline?.toISOString() || null,
        tags: tagsArray,
        is_featured: values.is_featured,
        // Pricing fields
        individual_price: values.individual_price ? parseFloat(values.individual_price) : 0,
        team_base_price: values.team_base_price ? parseFloat(values.team_base_price) : 0,
        price_per_member: values.price_per_member ? parseFloat(values.price_per_member) : 0,
        has_custom_team_pricing: values.has_custom_team_pricing,
      };

      const {data, error} = await supabase
        .from('events')
        // @ts-expect-error - Supabase generated types have strict inference issues
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: isDraft ? 'Draft Saved' : 'Event Published',
        description: isDraft
          ? 'Your event has been saved as a draft.'
          : 'Your event has been published successfully!',
      });

      router.push('/dashboard/organizer');
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container py-8 space-y-8 max-w-4xl">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!user || profile?.role !== 'organizer') {
    return null;
  }

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
          <p className="text-muted-foreground">Fill in the details to create your event</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => onSubmit(values, false))} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Event Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event in detail..."
                        className="resize-none min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Minimum 20 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="college_id"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>College</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select college (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colleges.map((college) => (
                            <SelectItem key={college.id} value={college.id}>
                              {college.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Participation Type */}
              <FormField
                control={form.control}
                name="participation_type"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Participation Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select participation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual Only</SelectItem>
                        <SelectItem value="team">Team Only</SelectItem>
                        <SelectItem value="both">Both Individual & Team</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose whether participants can register individually, as a team, or both
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Team Size - Only show if participation type is team or both */}
              {(form.watch('participation_type') === 'team' || form.watch('participation_type') === 'both') && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="team_size_min"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Minimum Team Size *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            placeholder="e.g., 2"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum members required per team
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="team_size_max"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Maximum Team Size *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            placeholder="e.g., 5"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum members allowed per team
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Pricing
              </CardTitle>
              <CardDescription>Set pricing for your event registrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Individual Price */}
              {(form.watch('participation_type') === 'individual' || form.watch('participation_type') === 'both') && (
                <FormField
                  control={form.control}
                  name="individual_price"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Individual Registration Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g., 500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Price for individual registrations (₹). Set to 0 for free.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Team Pricing */}
              {(form.watch('participation_type') === 'team' || form.watch('participation_type') === 'both') && (
                <>
                  <FormField
                    control={form.control}
                    name="has_custom_team_pricing"
                    render={({field}) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Custom Team Pricing
                          </FormLabel>
                          <FormDescription>
                            Enable tiered pricing based on team size (e.g., 2-3 members = ₹500, 4-5 members = ₹800)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {!form.watch('has_custom_team_pricing') && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="team_base_price"
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>Team Base Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="e.g., 1000"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Base price for a team (₹)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="price_per_member"
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>Price Per Additional Member</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="e.g., 200"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Cost per additional team member (₹)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {form.watch('has_custom_team_pricing') && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> Custom tiered pricing can be configured after creating the event from the admin dashboard.
                        You'll be able to set different prices for different team size ranges.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date & Time
              </CardTitle>
              <CardDescription>When will your event take place?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_time"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Start Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>End Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="registration_deadline"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Registration Deadline</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Optional: Last date to register</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
              <CardDescription>Where will your event be held?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="location"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Main Auditorium, Building A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="venue_details"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Venue Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional venue information, directions, parking details, etc."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
              <CardDescription>Configure capacity, images, and tags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="max_attendees"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Maximum Attendees</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="Leave empty for unlimited"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Event Image URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="https://example.com/image.jpg"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Enter a URL to an event banner image</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="music, dance, workshop (comma-separated)"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Separate tags with commas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_global"
                render={({field}) => (
                  <FormItem className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-0.5">
                      <FormLabel>Global Event</FormLabel>
                      <FormDescription>
                        Make this event visible to all users (if off, only visible to users from selected college)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({field}) => (
                  <FormItem className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-0.5">
                      <FormLabel>Featured Event</FormLabel>
                      <FormDescription>
                        Display this event prominently on the homepage
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={form.handleSubmit((values) => onSubmit(values, true))}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Publish Event
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
