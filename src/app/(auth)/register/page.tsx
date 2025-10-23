'use client';

import {useState, useEffect} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {Loader2, Briefcase, User, Mail, Lock, CheckCircle2, Building2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useToast} from '@/hooks/use-toast';
import {useAuth} from '@/hooks/use-auth';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {supabase} from '@/lib/supabase/client';

const organizerSchema = z.object({
  organizationName: z.string().min(2, {message: 'Please enter your organization name.'}),
  contactPerson: z.string().min(2, {message: 'Please enter your name.'}),
  email: z.string().email({message: 'Please enter a valid email.'}),
  password: z.string().min(6, {message: 'Password must be at least 6 characters.'}),
  collegeId: z.string().optional(),
});

type FormValues = z.infer<typeof organizerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {toast} = useToast();
  const {signUp} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [colleges, setColleges] = useState<any[]>([]);

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    try {
      const {data} = await supabase
        .from('colleges')
        .select('*')
        .order('name');
      
      setColleges(data || []);
    } catch (error) {
      console.error('Error loading colleges:', error);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(organizerSchema),
    defaultValues: {
      organizationName: '',
      contactPerson: '',
      email: '',
      password: '',
      collegeId: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const {error} = await signUp(
        values.email,
        values.password,
        values.contactPerson,
        'organizer',
        values.organizationName,
        values.collegeId
      );

      if (error) {
        throw error;
      }

      setRegisteredEmail(values.email);
      setShowConfirmation(true);
      
      toast({
        title: 'Account Created',
        description: 'Please check your email to verify your account.',
      });
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error?.message || 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (showConfirmation) {
    return (
      <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-sm border-white/20">
        <CardHeader className="items-center text-center space-y-4 pb-6">
          <div className="bg-green-500/20 p-4 rounded-full ring-4 ring-green-500/10">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription className="text-base">We&apos;ve sent you a confirmation link</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-primary/20 bg-primary/5">
            <Mail className="h-4 w-4 text-primary" />
            <AlertTitle className="text-base font-semibold">Verify your email address</AlertTitle>
            <AlertDescription className="space-y-3 mt-2">
              <p className="text-sm">We&apos;ve sent a confirmation email to:</p>
              <div className="bg-background/50 rounded-md p-3 border border-primary/10">
                <p className="font-semibold text-foreground break-all">{registeredEmail}</p>
              </div>
              <p className="text-sm leading-relaxed">
                Click the link in the email to verify your account and complete the registration process.
              </p>
            </AlertDescription>
          </Alert>
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-white/10">
            <div className="flex items-start gap-3 text-sm">
              <span className="text-xl">📧</span>
              <p>Check your inbox and spam folder</p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-xl">⏱️</span>
              <p>The verification link expires in 24 hours</p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-xl">🔄</span>
              <p>Didn&apos;t receive it? Try signing up again</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button 
            className="w-full" 
            onClick={() => router.push('/login')}
          >
            Go to Login
          </Button>
          <div className="text-sm text-muted-foreground text-center">
            Already verified?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-sm border-white/20">
      <CardHeader className="items-center text-center space-y-4">
        <div className="bg-primary/20 p-3 rounded-lg">
          <Briefcase className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">Become an Organiser</CardTitle>
          <CardDescription>Register to start organizing events</CardDescription>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="organizationName"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Organisation Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter organisation name" 
                      disabled={isLoading}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactPerson"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your name" 
                      disabled={isLoading}
                      {...field} 
                    />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Enter organisation email" 
                      disabled={isLoading}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your password" 
                      disabled={isLoading}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collegeId"
              render={({field}) => (
                <FormItem>
                  <FormLabel>College</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                        <SelectTrigger className="pl-9">
                          <SelectValue placeholder="Select your college (optional)" />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Organizers from the same college can collaborate and see each other&apos;s events
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
            <div className="text-sm text-muted-foreground text-center">
              Already registered?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Not an organiser?{' '}
              <Link href="/register-user" className="text-primary hover:underline font-medium">
                Register as a user
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
