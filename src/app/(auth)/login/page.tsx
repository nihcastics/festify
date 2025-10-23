'use client';

import {useState, useEffect} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {Loader2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Separator} from '@/components/ui/separator';
import {useToast} from '@/hooks/use-toast';
import {useAuth} from '@/hooks/use-auth';

const formSchema = z.object({
  email: z.string().email({message: 'Please enter a valid email.'}),
  password: z.string().min(6, {message: 'Password must be at least 6 characters.'}),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {toast} = useToast();
  const {signIn, profile, user, loading: authLoading} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const {error} = await signIn(values.email, values.password);
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Logged in successfully.',
      });
      
      setJustLoggedIn(true);
    } catch (error: any) {
      // Check if it's an email confirmation error
      if (error?.message?.toLowerCase().includes('email not confirmed')) {
        toast({
          title: 'Email Not Verified',
          description: 'Please check your email and click the verification link before logging in.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login Failed',
          description: error?.message || 'Invalid credentials. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Redirect after successful login and profile is loaded
  useEffect(() => {
    if (justLoggedIn && profile && !isLoading) {
      if (profile.role === 'organizer') {
        router.push('/dashboard/organizer');
      } else if (profile.role === 'attendee') {
        router.push('/dashboard/attendee');
      } else {
        router.push('/');
      }
    }
  }, [profile, isLoading, justLoggedIn, router]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="you@example.com" 
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
                      placeholder="••••••••" 
                      disabled={isLoading}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Log In'}
            </Button>
            <div className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{' '}
              <Link href="/register-user" className="text-primary hover:underline font-medium">
                Sign up as a new user
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
      <Separator className="my-4" />
      <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
        Are you an organiser?{' '}
        <Link href="/register" className="text-primary hover:underline font-medium">
          Register or Login here
        </Link>
      </div>
    </Card>
  );
}
