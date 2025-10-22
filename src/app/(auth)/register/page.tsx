'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import {useState} from 'react';
import {Loader2, Briefcase, User, Mail, Lock} from 'lucide-react';

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
import {useToast} from '@/hooks/use-toast';
import {auth} from '@/lib/firebase/config';

const organizerSchema = z.object({
  organizationName: z.string().min(2, {message: 'Please enter your organization name.'}),
  contactPerson: z.string().min(2, {message: 'Please enter your name.'}),
  email: z.string().email({message: 'Please enter a valid email.'}),
  password: z.string().min(6, {message: 'Password must be at least 6 characters.'}),
});

export default function RegisterPage() {
  const router = useRouter();
  const {toast} = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof organizerSchema>>({
    resolver: zodResolver(organizerSchema),
    defaultValues: {
      organizationName: '',
      contactPerson: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof organizerSchema>) {
    setIsLoading(true);
    if (!auth) {
      toast({
        title: 'Authentication Error',
        description: 'Firebase is not configured. Please check your environment variables.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, {displayName: values.contactPerson});

      // Here you would typically save organizer-specific data to Firestore
      // For example:
      // await setDoc(doc(db, "organizers", userCredential.user.uid), {
      //   organizationName: values.organizationName,
      //   contactPerson: values.contactPerson,
      //   email: values.email,
      // });

      toast({
        title: 'Account Created',
        description: 'You have been successfully registered.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-white/20">
      <CardHeader className="items-center text-center space-y-4">
        <div className="bg-primary/20 p-3 rounded-lg">
          <Briefcase className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl text-white">Become an Organiser</CardTitle>
          <CardDescription className="text-muted-foreground">Register to start organizing events</CardDescription>
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
                  <FormLabel className="text-white/80">Organisation Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Enter organisation name" {...field} className="pl-9 bg-background/50 border-white/20 text-white placeholder:text-muted-foreground" />
                    </div>
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
                  <FormLabel className="text-white/80">Contact Person</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Enter your name" {...field} className="pl-9 bg-background/50 border-white/20 text-white placeholder:text-muted-foreground" />
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
                  <FormLabel className="text-white/80">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Enter organisation email" {...field} className="pl-9 bg-background/50 border-white/20 text-white placeholder:text-muted-foreground" />
                    </div>
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
                  <FormLabel className="text-white/80">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="Enter your password" {...field} className="pl-9 bg-background/50 border-white/20 text-white placeholder:text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
            <div className="text-sm text-muted-foreground">
              Already registered?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
             <div className="text-sm text-muted-foreground">
              Not an organiser?{' '}
              <Link href="/register-user" className="text-primary hover:underline">
                Register as a user
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
