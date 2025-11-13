import { Sparkles, Users, Calendar, Target, Heart, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 dark:from-purple-900 dark:via-violet-900 dark:to-indigo-900 py-24">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">About Festify</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Your Gateway to
              <span className="block text-gradient-warm mt-2">College Events</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Connecting students with unforgettable experiences across campuses in India
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="glass p-8 group hover:scale-105 transition-transform duration-300">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-6 glow-md group-hover:scale-110 transition-transform">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To create a unified platform that brings together students, organizers, and colleges,
                making it effortless to discover, manage, and attend college events across India.
              </p>
            </Card>

            <Card className="glass p-8 group hover:scale-105 transition-transform duration-300">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-6 glow-md group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become India's most trusted and comprehensive college event platform,
                fostering vibrant campus communities and creating lasting memories for students.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose Festify?</h2>
            <p className="text-xl text-muted-foreground">Everything you need in one place</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Calendar,
                color: "from-purple-500 to-violet-600",
                title: "Easy Discovery",
                description: "Find events across multiple colleges with powerful search and filters"
              },
              {
                icon: Users,
                color: "from-indigo-500 to-blue-600",
                title: "Seamless Registration",
                description: "Register for events in seconds with secure payment processing"
              },
              {
                icon: Zap,
                color: "from-pink-500 to-rose-600",
                title: "Real-time Updates",
                description: "Stay informed with instant notifications and event updates"
              }
            ].map((feature, i) => (
              <Card key={i} className="glass p-6 group hover:scale-105 transition-all duration-300">
                <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 glow-md group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground">Passionate developers building the future of college events</p>
          </div>
          
          {/* Lead Developer Card - Highlighted */}
          <div className="max-w-lg mx-auto mb-16">
            <Card className="relative glass p-12 text-center group hover:scale-[1.02] transition-all duration-300 border-2 border-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 shadow-2xl overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/10" />
              
              {/* Subtle glow effects */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>HEAD PROJECT DEVELOPER</span>
                </div>
                
                {/* Avatar */}
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-5xl font-bold text-white mx-auto mb-6 shadow-2xl ring-4 ring-purple-500/30 group-hover:ring-purple-500/50 transition-all">
                  SS
                </div>
                
                {/* Name */}
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Sachin S
                </h3>
                
                {/* Role */}
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3">
                  Head Project Developer
                </p>
                
                {/* Quote */}
                <p className="text-sm text-muted-foreground italic max-w-sm mx-auto">
                  Leading the vision and architecture of Festify
                </p>
              </div>
            </Card>
          </div>
          
          {/* Team Members Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Rishika Raj", id: "RA2411030010059", role: "Full Stack Developer", color: "from-pink-500 to-rose-600", initials: "RR", specialty: "UI/UX & Frontend" },
              { name: "Allan Roy", id: "RA2411030010028", role: "Full Stack Developer", color: "from-purple-500 to-violet-600", initials: "AR", specialty: "Backend & APIs" },
              { name: "Shreya Sunil", id: "RA2411030010048", role: "Full Stack Developer", color: "from-indigo-500 to-blue-600", initials: "SS", specialty: "Database & Integration" }
            ].map((member, i) => (
              <Card key={i} className="glass p-8 text-center group hover:scale-105 transition-all duration-300 border border-transparent hover:border-purple-500/30 hover:shadow-xl">
                <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-lg ring-2 ring-offset-2 ring-offset-background ring-${member.color.split('-')[1]}-500/30 group-hover:ring-${member.color.split('-')[1]}-500/60 group-hover:scale-110 transition-all`}>
                  {member.initials}
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{member.id}</p>
                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-2">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">{member.role}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="font-medium">Focus:</span> {member.specialty}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 dark:from-purple-900 dark:via-violet-900 dark:to-indigo-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students discovering amazing events across India
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/events" className="px-8 py-4 rounded-xl bg-white text-purple-600 font-semibold hover:scale-105 transition-transform duration-300 shadow-lg">
              Browse Events
            </a>
            <a href="/register" className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 font-semibold hover:scale-105 transition-transform duration-300">
              Create Account
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
