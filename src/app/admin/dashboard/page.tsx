'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Calendar,
  Building2,
  Users,
  Database as DatabaseIcon,
  Settings,
  BarChart3,
  LogOut,
  Trash2,
  Edit,
  Check,
  X,
  Plus,
  Eye,
  AlertCircle,
  Ticket,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Database } from '@/lib/supabase/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalColleges: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    totalTeams: 0,
    totalNotifications: 0,
    totalTickets: 0,
    totalPayments: 0,
  });

  // Data states
  const [events, setEvents] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; name: string }>({
    open: false,
    type: '',
    id: '',
    name: '',
  });

  // Edit college state
  const [editCollege, setEditCollege] = useState<any>(null);
  const [collegeForm, setCollegeForm] = useState({
    name: '',
    location: '',
    description: '',
    established_year: '',
    website: '',
    logo_url: '',
  });

  // Edit user state
  const [editUser, setEditUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    role: 'attendee' as 'organizer' | 'attendee',
    college_id: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    checkAdminAuth();
    loadDashboardData();
  }, []);

  const checkAdminAuth = () => {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      router.push('/admin/login');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Supabase Session:', session ? 'Active' : 'None');
      console.log('🔐 User ID:', session?.user?.id || 'NULL');
      
      if (!session) {
        console.error('❌ NO SUPABASE SESSION - Admin must be logged in through Supabase Auth!');
        console.error('💡 The admin dashboard queries will fail because auth.uid() is NULL');
        console.error('💡 Solution: Create an actual admin user in Supabase and log in with that');
      }

      // Parallel loading of all stats for better performance
      const statsPromises = [
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('colleges').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('*', { count: 'exact', head: true }),
        supabase.from('teams').select('*', { count: 'exact', head: true }),
        supabase.from('notifications').select('*', { count: 'exact', head: true }),
        supabase.from('tickets').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true }),
      ];

      const statsResults = await Promise.allSettled(statsPromises);
      
      // Log stats results
      statsResults.forEach((result, index) => {
        const tables = ['events', 'colleges', 'profiles', 'registrations', 'teams', 'notifications', 'tickets', 'payments'];
        if (result.status === 'rejected') {
          console.error(`❌ Stats error for ${tables[index]}:`, result.reason);
        } else if (result.value.error) {
          console.error(`❌ Stats error for ${tables[index]}:`, result.value.error);
        } else {
          console.log(`✓ Stats ${tables[index]}: ${result.value.count || 0} records`);
        }
      });

      setStats({
        totalEvents: statsResults[0].status === 'fulfilled' ? statsResults[0].value.count || 0 : 0,
        totalColleges: statsResults[1].status === 'fulfilled' ? statsResults[1].value.count || 0 : 0,
        totalUsers: statsResults[2].status === 'fulfilled' ? statsResults[2].value.count || 0 : 0,
        totalRegistrations: statsResults[3].status === 'fulfilled' ? statsResults[3].value.count || 0 : 0,
        totalTeams: statsResults[4].status === 'fulfilled' ? statsResults[4].value.count || 0 : 0,
        totalNotifications: statsResults[5].status === 'fulfilled' ? statsResults[5].value.count || 0 : 0,
        totalTickets: statsResults[6].status === 'fulfilled' ? statsResults[6].value.count || 0 : 0,
        totalPayments: statsResults[7].status === 'fulfilled' ? statsResults[7].value.count || 0 : 0,
      });

      // Parallel loading of all data
      const dataPromises = [
        supabase
          .from('events')
          .select('*, profiles(full_name, organization_name), categories(name), colleges(name)')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('colleges').select('*').order('name'),
        supabase.from('profiles').select('*, colleges(name)').order('created_at', { ascending: false }).limit(50),
        supabase
          .from('registrations')
          .select(`
            *, 
            profiles(full_name, email), 
            events(title)
          `)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('teams')
          .select('*,events(title)')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('notifications')
          .select('*, profiles(full_name, email)')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('tickets')
          .select('*, events(title), registrations(profiles(full_name, email))')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('payments')
          .select('*, registrations(events(title), profiles(full_name, email)), tickets(ticket_code, ticket_type)')
          .order('created_at', { ascending: false })
          .limit(100),
      ];

      const dataResults = await Promise.allSettled(dataPromises);

      // Log any errors for debugging
      dataResults.forEach((result, index) => {
        const tables = ['events', 'colleges', 'profiles', 'registrations', 'teams', 'notifications', 'tickets', 'payments'];
        if (result.status === 'rejected') {
          console.error(`Error loading ${tables[index]}:`, result.reason);
        } else if (result.value.error) {
          console.error(`Error loading ${tables[index]}:`, result.value.error);
        } else {
          console.log(`✓ Loaded ${tables[index]}:`, result.value.data?.length || 0, 'records');
        }
      });

      setEvents(dataResults[0].status === 'fulfilled' && !dataResults[0].value.error ? dataResults[0].value.data || [] : []);
      setColleges(dataResults[1].status === 'fulfilled' && !dataResults[1].value.error ? dataResults[1].value.data || [] : []);
      setUsers(dataResults[2].status === 'fulfilled' && !dataResults[2].value.error ? dataResults[2].value.data || [] : []);
      setRegistrations(dataResults[3].status === 'fulfilled' && !dataResults[3].value.error ? dataResults[3].value.data || [] : []);
      setTeams(dataResults[4].status === 'fulfilled' && !dataResults[4].value.error ? dataResults[4].value.data || [] : []);
      setNotifications(dataResults[5].status === 'fulfilled' && !dataResults[5].value.error ? dataResults[5].value.data || [] : []);
      setTickets(dataResults[6].status === 'fulfilled' && !dataResults[6].value.error ? dataResults[6].value.data || [] : []);
      setPayments(dataResults[7].status === 'fulfilled' && !dataResults[7].value.error ? dataResults[7].value.data || [] : []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminMode');
    router.push('/');
    router.refresh();
  };

  const handleDelete = async () => {
    try {
      const { type, id } = deleteDialog;
      let tableName = type === 'event' ? 'events' : type === 'college' ? 'colleges' : 'profiles';

      await supabase.from(tableName).delete().eq('id', id);

      toast({
        title: 'Success',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`,
      });

      loadDashboardData();
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEventStatus = async (eventId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('events')
        // @ts-expect-error - Admin operations bypass RLS type checking
        .update({ event_status: newStatus })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event status updated successfully',
      });

      loadDashboardData();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event status',
        variant: 'destructive',
      });
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        // @ts-expect-error - Admin operations bypass RLS type checking
        .update({ 
          registration_status: 'cancelled',
          cancellation_reason: 'Cancelled by admin',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Registration cancelled successfully',
      });

      loadDashboardData();
    } catch (error) {
      console.error('Cancel error:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel registration',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      // Team members will be deleted automatically via CASCADE
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Team deleted successfully',
      });

      loadDashboardData();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete team',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notification deleted successfully',
      });

      loadDashboardData();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const handleSaveCollege = async () => {
    try {
      // Validate required fields
      if (!collegeForm.name.trim() || !collegeForm.location.trim()) {
        toast({
          title: 'Validation Error',
          description: 'College name and location are required',
          variant: 'destructive',
        });
        return;
      }

      const collegeData = {
        name: collegeForm.name.trim(),
        location: collegeForm.location.trim(),
        description: collegeForm.description.trim() || null,
        established_year: collegeForm.established_year ? parseInt(collegeForm.established_year) : null,
        website: collegeForm.website.trim() || null,
        logo_url: collegeForm.logo_url.trim() || null,
      };

      if (editCollege) {
        // Update existing college
        const { error } = await supabase
          .from('colleges')
          // @ts-expect-error - Admin operations bypass RLS type checking
          .update(collegeData)
          .eq('id', editCollege.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'College updated successfully',
        });
      } else {
        // Add new college
        const { error } = await supabase
          .from('colleges')
          // @ts-expect-error - Admin operations bypass RLS type checking
          .insert(collegeData);

        if (error) {
          console.error('Insert error details:', error);
          throw error;
        }

        toast({
          title: 'Success',
          description: 'College added successfully',
        });
      }

      setEditCollege(null);
      setCollegeForm({
        name: '',
        location: '',
        description: '',
        established_year: '',
        website: '',
        logo_url: '',
      });
      loadDashboardData();
    } catch (error: any) {
      console.error('Save error:', error);
      
      // Check if it's a permission error
      if (error.message?.includes('permission') || error.message?.includes('policy') || error.code === '42501') {
        toast({
          title: 'Database Permission Error',
          description: 'Please run the SQL script to disable Row Level Security. Check the console for the SQL command.',
          variant: 'destructive',
        });
        console.log('%c🚨 SQL REQUIRED:', 'color: red; font-weight: bold; font-size: 16px');
        console.log('Run this SQL in your Supabase SQL Editor:');
        console.log(`
ALTER TABLE colleges DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
        `);
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to save college',
          variant: 'destructive',
        });
      }
    }
  };

  const startEditCollege = (college: any) => {
    setEditCollege(college);
    setCollegeForm({
      name: college.name,
      location: college.location,
      description: college.description || '',
      established_year: college.established_year?.toString() || '',
      website: college.website || '',
      logo_url: college.logo_url || '',
    });
  };

  const handleSaveUser = async () => {
    try {
      // Validate required fields
      if (!userForm.full_name.trim() || !userForm.email.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Name and email are required',
          variant: 'destructive',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userForm.email.trim())) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid email address',
          variant: 'destructive',
        });
        return;
      }

      const userData = {
        full_name: userForm.full_name.trim(),
        email: userForm.email.trim().toLowerCase(),
        role: userForm.role,
        college_id: userForm.college_id || null,
        phone: userForm.phone.trim() || null,
        bio: userForm.bio.trim() || null,
      };

      if (editUser) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          // @ts-expect-error - Admin operations bypass RLS type checking
          .update(userData)
          .eq('id', editUser.id);

        if (error) {
          console.error('Update error details:', error);
          throw error;
        }

        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        // Add new user - first create auth user, then profile
        // Note: For simplicity, we'll just create the profile directly
        // In production, you'd want to use Supabase Auth properly
        const { error } = await supabase
          .from('profiles')
          // @ts-expect-error - Admin operations bypass RLS type checking
          .insert(userData);

        if (error) {
          console.error('Insert error details:', error);
          throw error;
        }

        toast({
          title: 'Success',
          description: 'User added successfully',
        });
      }

      setEditUser(null);
      setUserForm({
        full_name: '',
        email: '',
        role: 'attendee',
        college_id: '',
        phone: '',
        bio: '',
      });
      loadDashboardData();
    } catch (error: any) {
      console.error('Save user error:', error);
      
      if (error.message?.includes('permission') || error.message?.includes('policy') || error.code === '42501') {
        toast({
          title: 'Database Permission Error',
          description: 'Please run the SQL script to disable Row Level Security.',
          variant: 'destructive',
        });
      } else if (error.message?.includes('duplicate') || error.code === '23505') {
        toast({
          title: 'Error',
          description: 'A user with this email already exists',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to save user',
          variant: 'destructive',
        });
      }
    }
  };

  const startEditUser = (user: any) => {
    setEditUser(user);
    setUserForm({
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role || 'attendee',
      college_id: user.college_id || '',
      phone: user.phone || '',
      bio: user.bio || '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-orange-950/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl blur-md opacity-50" />
                <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 flex items-center justify-center glow-lg shadow-xl">
                  <Shield className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Festify Management Console</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:scale-105"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="py-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-orange-600/5 to-amber-600/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass border-purple-200/50 dark:border-purple-800/50 hover:scale-105 transition-all duration-300 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Total Events</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalEvents}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl blur-sm opacity-50" />
                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <Calendar className="h-7 w-7 text-white drop-shadow" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-emerald-200/50 dark:border-emerald-800/50 hover:scale-105 transition-all duration-300 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Total Colleges</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stats.totalColleges}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-sm opacity-50" />
                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <Building2 className="h-7 w-7 text-white drop-shadow" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-blue-200/50 dark:border-blue-800/50 hover:scale-105 transition-all duration-300 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Total Users</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalUsers}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl blur-sm opacity-50" />
                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Users className="h-7 w-7 text-white drop-shadow" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-orange-200/50 dark:border-orange-800/50 hover:scale-105 transition-all duration-300 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Registrations</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{stats.totalRegistrations}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-sm opacity-50" />
                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                      <BarChart3 className="h-7 w-7 text-white drop-shadow" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-pink-200/50 dark:border-pink-800/50 hover:scale-105 transition-all duration-300 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Teams</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">{stats.totalTeams}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl blur-sm opacity-50" />
                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                      <Users className="h-7 w-7 text-white drop-shadow" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-amber-200/50 dark:border-amber-800/50 hover:scale-105 transition-all duration-300 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Notifications</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">{stats.totalNotifications}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl blur-sm opacity-50" />
                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
                      <AlertCircle className="h-7 w-7 text-white drop-shadow" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Management Tabs */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full max-w-6xl mx-auto grid-cols-4 lg:grid-cols-8 mb-8 h-auto lg:h-12 p-1 bg-muted/50 backdrop-blur-sm gap-1">
              <TabsTrigger value="events" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger value="colleges" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Colleges</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="registrations" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Registrations</span>
              </TabsTrigger>
              <TabsTrigger value="teams" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Teams</span>
              </TabsTrigger>
              <TabsTrigger value="tickets" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                <Ticket className="h-4 w-4" />
                <span className="hidden sm:inline">Tickets</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
                <DatabaseIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Payments</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
                <AlertCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events">
              <Card className="glass border-purple-200/50 dark:border-purple-800/50 shadow-xl">
                <CardHeader className="border-b bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-950/50 dark:to-indigo-950/50">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Event Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Organizer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>{event.profiles?.full_name || 'Unknown'}</TableCell>
                            <TableCell>{format(new Date(event.start_date), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                              <Badge
                                variant={event.event_status === 'published' ? 'default' : 'secondary'}
                                className="capitalize"
                              >
                                {event.event_status}
                              </Badge>
                            </TableCell>
                            <TableCell>{event.categories?.name || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {event.event_status !== 'published' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateEventStatus(event.id, 'published')}
                                    className="gap-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    Publish
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateEventStatus(event.id, 'draft')}
                                    className="gap-1"
                                  >
                                    <X className="h-3 w-3" />
                                    Unpublish
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      type: 'event',
                                      id: event.id,
                                      name: event.title,
                                    })
                                  }
                                  className="gap-1 hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colleges Tab */}
            <TabsContent value="colleges">
              <div className="space-y-6">
                {/* Add/Edit College Form */}
                <Card className="glass border-emerald-200/50 dark:border-emerald-800/50 shadow-xl">
                  <CardHeader className="border-b bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/50 dark:to-teal-950/50">
                    <CardTitle className="flex items-center gap-2">
                      {editCollege ? <Edit className="h-5 w-5 text-emerald-600" /> : <Plus className="h-5 w-5 text-emerald-600" />}
                      {editCollege ? 'Edit College' : 'Add New College'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="College Name *"
                        value={collegeForm.name}
                        onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Location *"
                        value={collegeForm.location}
                        onChange={(e) => setCollegeForm({ ...collegeForm, location: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Established Year"
                        type="number"
                        value={collegeForm.established_year}
                        onChange={(e) => setCollegeForm({ ...collegeForm, established_year: e.target.value })}
                      />
                      <Input
                        placeholder="Website URL"
                        value={collegeForm.website}
                        onChange={(e) => setCollegeForm({ ...collegeForm, website: e.target.value })}
                      />
                      <Input
                        placeholder="Logo URL (https://...)"
                        value={collegeForm.logo_url}
                        onChange={(e) => setCollegeForm({ ...collegeForm, logo_url: e.target.value })}
                        className="md:col-span-2"
                      />
                      <Textarea
                        placeholder="Description"
                        value={collegeForm.description}
                        onChange={(e) => setCollegeForm({ ...collegeForm, description: e.target.value })}
                        className="md:col-span-2"
                        rows={3}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 mb-4">* Required fields</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveCollege} 
                        className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        disabled={!collegeForm.name.trim() || !collegeForm.location.trim()}
                      >
                        {editCollege ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {editCollege ? 'Update College' : 'Add College'}
                      </Button>
                      {editCollege && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditCollege(null);
                            setCollegeForm({
                              name: '',
                              location: '',
                              description: '',
                              established_year: '',
                              website: '',
                              logo_url: '',
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Colleges List */}
                <Card className="glass border-emerald-200/50 dark:border-emerald-800/50 shadow-xl">
                  <CardHeader className="border-b bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/50 dark:to-teal-950/50">
                    <CardTitle className="flex items-center gap-2">
                      <DatabaseIcon className="h-5 w-5 text-emerald-600" />
                      All Colleges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Established</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {colleges.map((college) => (
                            <TableRow key={college.id}>
                              <TableCell className="font-medium">{college.name}</TableCell>
                              <TableCell>{college.location}</TableCell>
                              <TableCell>{college.established_year || 'N/A'}</TableCell>
                              <TableCell>
                                {college.website ? (
                                  <a
                                    href={college.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm"
                                  >
                                    Visit
                                  </a>
                                ) : (
                                  'N/A'
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditCollege(college)}
                                    className="gap-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setDeleteDialog({
                                        open: true,
                                        type: 'college',
                                        id: college.id,
                                        name: college.name,
                                      })
                                    }
                                    className="gap-1 hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="space-y-6">
                {/* Add/Edit User Form */}
                <Card className="glass border-blue-200/50 dark:border-blue-800/50 shadow-xl">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/50 dark:to-cyan-950/50">
                    <CardTitle className="flex items-center gap-2">
                      {editUser ? <Edit className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
                      {editUser ? 'Edit User' : 'Add New User'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Full Name *"
                        value={userForm.full_name}
                        onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Email *"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        required
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role *</label>
                        <Select
                          value={userForm.role}
                          onValueChange={(value: 'organizer' | 'attendee') => setUserForm({ ...userForm, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attendee">Attendee</SelectItem>
                            <SelectItem value="organizer">Organizer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">College</label>
                        <Select
                          value={userForm.college_id || undefined}
                          onValueChange={(value) => setUserForm({ ...userForm, college_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select college (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {colleges.map((college) => (
                              <SelectItem key={college.id} value={college.id}>
                                {college.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        placeholder="Phone Number"
                        value={userForm.phone}
                        onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      />
                      <Textarea
                        placeholder="Bio / Description"
                        value={userForm.bio}
                        onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
                        className="md:col-span-2"
                        rows={3}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 mb-4">* Required fields</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveUser} 
                        className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        disabled={!userForm.full_name.trim() || !userForm.email.trim()}
                      >
                        {editUser ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {editUser ? 'Update User' : 'Add User'}
                      </Button>
                      {editUser && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditUser(null);
                            setUserForm({
                              full_name: '',
                              email: '',
                              role: 'attendee',
                              college_id: '',
                              phone: '',
                              bio: '',
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Users List */}
                <Card className="glass border-blue-200/50 dark:border-blue-800/50 shadow-xl">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/50 dark:to-cyan-950/50">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      All Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>College</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.full_name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge className="capitalize" variant={user.role === 'organizer' ? 'default' : 'secondary'}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.college_id 
                                  ? colleges.find(c => c.id === user.college_id)?.name || 'Unknown'
                                  : <span className="text-muted-foreground text-sm">No college</span>
                                }
                              </TableCell>
                              <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditUser(user)}
                                    className="gap-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setDeleteDialog({
                                        open: true,
                                        type: 'user',
                                        id: user.id,
                                        name: user.full_name,
                                      })
                                    }
                                    className="gap-1 hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Registrations Tab */}
            <TabsContent value="registrations">
              <div className="space-y-4">
                <Card className="glass border-orange-200/50 dark:border-orange-800/50">
                  <CardHeader className="border-b border-orange-200/30 dark:border-orange-800/30 bg-gradient-to-r from-orange-500/5 to-red-600/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          <BarChart3 className="h-6 w-6 text-orange-600" />
                          Event Registrations
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Manage all event registrations and teams
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>User</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrations.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="h-32 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                  <BarChart3 className="h-12 w-12 mb-2 opacity-20" />
                                  <p>No registrations found</p>
                                  <p className="text-xs">Registrations will appear here once users register for events</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            registrations.map((registration: any) => (
                            <TableRow key={registration.id}>
                              <TableCell className="font-medium">
                                <div>
                                  <div>{registration.profiles?.full_name || 'Unknown'}</div>
                                  <div className="text-xs text-muted-foreground">{registration.profiles?.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>{registration.events?.title || 'N/A'}</TableCell>
                              <TableCell>
                                {registration.is_team_registration ? (
                                  <Badge className="bg-purple-500 hover:bg-purple-600">Team</Badge>
                                ) : (
                                  <Badge variant="secondary">Individual</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {registration.registration_status === 'confirmed' && (
                                  <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                                )}
                                {registration.registration_status === 'cancelled' && (
                                  <Badge variant="destructive">Cancelled</Badge>
                                )}
                                {registration.registration_status === 'pending' && (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                                {registration.registration_status === 'attended' && (
                                  <Badge className="bg-blue-500 hover:bg-blue-600">Attended</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {registration.payment_status === 'completed' && (
                                  <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
                                )}
                                {registration.payment_status === 'pending' && (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                                {registration.payment_status === 'failed' && (
                                  <Badge variant="destructive">Failed</Badge>
                                )}
                                {registration.payment_status === 'refunded' && (
                                  <Badge variant="secondary">Refunded</Badge>
                                )}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {registration.amount_paid ? `₹${registration.amount_paid}` : '₹0'}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {new Date(registration.created_at).toLocaleDateString()}
                                </div>
                                {registration.payment_completed_at && (
                                  <div className="text-xs text-muted-foreground">
                                    Paid: {new Date(registration.payment_completed_at).toLocaleDateString()}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {registration.registration_status !== 'cancelled' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCancelRegistration(registration.id)}
                                      className="gap-1 hover:bg-destructive hover:text-destructive-foreground"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams">
              <div className="space-y-4">
                <Card className="glass border-pink-200/50 dark:border-pink-800/50">
                  <CardHeader className="border-b border-pink-200/30 dark:border-pink-800/30 bg-gradient-to-r from-pink-500/5 to-rose-600/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                          <Users className="h-6 w-6 text-pink-600" />
                          Event Teams
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Manage all event teams and members
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Team Name</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Leader</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teams.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-32 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                  <Users className="h-12 w-12 mb-2 opacity-20" />
                                  <p>No teams found</p>
                                  <p className="text-xs">Teams will appear here when users register as teams</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            teams.map((team: any) => (
                            <TableRow key={team.id}>
                              <TableCell className="font-medium">{team.name || team.team_name || 'N/A'}</TableCell>
                              <TableCell>{team.events?.title || 'N/A'}</TableCell>
                              <TableCell>{team.team_leader_name || team.profiles?.full_name || 'Unknown'}</TableCell>
                              <TableCell>
                                {team.current_members && team.max_members ? (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {team.current_members}/{team.max_members}
                                    </Badge>
                                    {team.is_full && (
                                      <Badge className="bg-green-500 hover:bg-green-600">Full</Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {team.is_full !== undefined ? (
                                  team.is_full ? (
                                    <Badge className="bg-green-500 hover:bg-green-600">Complete</Badge>
                                  ) : (
                                    <Badge variant="secondary">Recruiting</Badge>
                                  )
                                ) : (
                                  <Badge variant="outline">Active</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(team.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteTeam(team.id)}
                                    className="gap-1 hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <div className="space-y-4">
                <Card className="glass border-amber-200/50 dark:border-amber-800/50">
                  <CardHeader className="border-b border-amber-200/30 dark:border-amber-800/30 bg-gradient-to-r from-amber-500/5 to-yellow-600/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                          <AlertCircle className="h-6 w-6 text-amber-600" />
                          User Notifications
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          View and manage system notifications
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>User</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {notifications.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-32 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                  <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
                                  <p>No notifications found</p>
                                  <p className="text-xs">System notifications will appear here</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            notifications.map((notification: any) => (
                            <TableRow key={notification.id} className={notification.is_read ? '' : 'bg-amber-50/50 dark:bg-amber-950/20'}>
                              <TableCell className="font-medium">
                                <div>
                                  <div>{notification.profiles?.full_name || 'Unknown'}</div>
                                  <div className="text-xs text-muted-foreground">{notification.profiles?.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {notification.notification_type === 'registration_confirmed' && (
                                  <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                                )}
                                {notification.notification_type === 'registration_cancelled' && (
                                  <Badge variant="destructive">Cancelled</Badge>
                                )}
                                {notification.notification_type === 'team_invite' && (
                                  <Badge className="bg-purple-500 hover:bg-purple-600">Team Invite</Badge>
                                )}
                                {notification.notification_type === 'team_joined' && (
                                  <Badge className="bg-blue-500 hover:bg-blue-600">Team Joined</Badge>
                                )}
                                {notification.notification_type === 'event_reminder' && (
                                  <Badge className="bg-orange-500 hover:bg-orange-600">Reminder</Badge>
                                )}
                                {!notification.notification_type && (
                                  <Badge variant="secondary">General</Badge>
                                )}
                              </TableCell>
                              <TableCell className="max-w-md truncate">{notification.message}</TableCell>
                              <TableCell>
                                {notification.is_read ? (
                                  <Badge variant="outline">Read</Badge>
                                ) : (
                                  <Badge className="bg-amber-500 hover:bg-amber-600">Unread</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(notification.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    className="gap-1 hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets">
              <Card className="glass border-violet-200/50 dark:border-violet-800/50 shadow-xl">
                <CardHeader className="border-b bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/50 dark:to-purple-950/50">
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-violet-600" />
                    Event Tickets
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    All generated tickets with validation status
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Ticket Code</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Issued</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tickets.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <Ticket className="h-12 w-12 mb-2 opacity-20" />
                                <p>No tickets found</p>
                                <p className="text-xs">Tickets will appear here after successful registrations</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          tickets.map((ticket: any) => (
                            <TableRow key={ticket.id}>
                              <TableCell className="font-mono font-medium">{ticket.ticket_code}</TableCell>
                              <TableCell>
                                {ticket.registrations?.profiles ? (
                                  <div>
                                    <div className="font-medium">{ticket.registrations.profiles.full_name}</div>
                                    <div className="text-xs text-muted-foreground">{ticket.registrations.profiles.email}</div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Unknown</span>
                                )}
                              </TableCell>
                              <TableCell>{ticket.events?.title || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {ticket.ticket_type}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold">₹{ticket.price}</TableCell>
                              <TableCell>
                                <Badge variant={ticket.is_valid ? 'default' : 'destructive'}>
                                  {ticket.is_valid ? '✓ Valid' : '✗ Invalid'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(ticket.issued_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card className="glass border-green-200/50 dark:border-green-800/50 shadow-xl">
                <CardHeader className="border-b bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/50 dark:to-emerald-950/50">
                  <CardTitle className="flex items-center gap-2">
                    <DatabaseIcon className="h-5 w-5 text-green-600" />
                    Payment Records
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    All payment transactions and records
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>User</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Ticket Code</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-32 text-center">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <DatabaseIcon className="h-12 w-12 mb-2 opacity-20" />
                                <p>No payments found</p>
                                <p className="text-xs">Payment records will appear here after transactions</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          payments.map((payment: any) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                {payment.registrations?.profiles ? (
                                  <div>
                                    <div className="font-medium">{payment.registrations.profiles.full_name}</div>
                                    <div className="text-xs text-muted-foreground">{payment.registrations.profiles.email}</div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Unknown</span>
                                )}
                              </TableCell>
                              <TableCell>{payment.registrations?.events?.title || 'N/A'}</TableCell>
                              <TableCell>
                                {payment.tickets?.ticket_code ? (
                                  <span className="font-mono text-xs">{payment.tickets.ticket_code}</span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                              </TableCell>
                              <TableCell className="font-bold text-green-600">₹{payment.amount}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {payment.payment_method}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={payment.payment_status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                                  {payment.payment_status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{payment.transaction_id}</TableCell>
                              <TableCell>
                                {new Date(payment.payment_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ ...deleteDialog, open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
