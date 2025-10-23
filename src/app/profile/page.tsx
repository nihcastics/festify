'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/hooks/use-auth';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {
  User,
  Mail,
  Briefcase,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Award,
  MapPin,
  Phone,
  Plus,
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
import {Label} from '@/components/ui/label';
import {Skeleton} from '@/components/ui/skeleton';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {useToast} from '@/hooks/use-toast';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Textarea} from '@/components/ui/textarea';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  organization_name: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const {user, profile, loading, updateProfile} = useAuth();
  const router = useRouter();
  const {toast} = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      bio: profile?.bio || '',
      phone: profile?.phone || '',
      website: profile?.website || '',
      organization_name: profile?.organization_name || '',
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        website: profile.website || '',
        organization_name: profile.organization_name || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const {error} = await updateProfile({
        full_name: values.full_name,
        bio: values.bio || null,
        phone: values.phone || null,
        website: values.website || null,
        organization_name: values.organization_name || null,
      });

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error?.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-8 max-w-4xl">
        <Skeleton className="h-12 w-48" />
        <div className="grid gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const initials = profile.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const roleColor = {
    admin: 'bg-red-500/10 text-red-500 border-red-500/20',
    organizer: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    attendee: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Header Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition" />
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl relative">
                <AvatarImage src="" alt={profile.full_name || 'User'} />
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {profile.full_name || 'User'}
                </h2>
                <Badge className={`${roleColor[profile.role]} text-sm px-3 py-1`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  {profile.email}
                </p>
                {profile.organization_name && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    {profile.organization_name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Member since {new Date(profile.created_at || '').toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Button variant="default" size="lg" className="gap-2" asChild>
                <a href={`/dashboard/${profile.role}`}>
                  View Dashboard
                </a>
              </Button>
              {profile.role === 'organizer' && (
                <Button variant="outline" size="lg" className="gap-2" asChild>
                  <a href="/dashboard/organizer/create-event">
                    <Plus className="h-4 w-4" />
                    Create Event
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            {isEditing ? 'Update your personal details below' : 'Your account information'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Your full name" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="your@email.com"
                            className="pl-9"
                            disabled
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="+91 xxxxx xxxxx" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="https://example.com" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {profile.role === 'organizer' && (
                  <FormField
                    control={form.control}
                    name="organization_name"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Organization Name (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Organization name" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="text-base font-medium">{profile.full_name || 'Not set'}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-base font-medium">{profile.email}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Role</Label>
                  <p className="text-base font-medium capitalize">{profile.role}</p>
                </div>

                {profile.phone && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="text-base font-medium">{profile.phone}</p>
                  </div>
                )}

                {profile.website && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Website</Label>
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-base font-medium text-primary hover:underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}

                {profile.organization_name && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Organization</Label>
                    <p className="text-base font-medium">{profile.organization_name}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Account Created</Label>
                  <p className="text-base font-medium">
                    {new Date(profile.created_at || '').toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="text-base font-medium">
                    {new Date(profile.updated_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>

              {profile.bio && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Bio</Label>
                  <p className="text-base leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Stats (for attendees and organizers) */}
      {profile.role !== 'admin' && (
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Activity
            </CardTitle>
            <CardDescription>Your engagement and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground">
                  {profile.role === 'organizer' ? 'Events Created' : 'Events Attended'}
                </p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground">
                  {profile.role === 'organizer' ? 'Total Registrations' : 'Upcoming Events'}
                </p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground">
                  {profile.role === 'organizer' ? 'Active Events' : 'Points Earned'}
                </p>
                <p className="text-3xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">••••••••</p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Email Verification</p>
              <p className="text-sm text-muted-foreground">
                {user.email_confirmed_at ? 'Verified' : 'Not verified'}
              </p>
            </div>
            {!user.email_confirmed_at && (
              <Button variant="outline" size="sm">
                Verify Email
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
