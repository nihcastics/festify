import { Shield, FileText, Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-900 dark:via-purple-900 dark:to-fuchsia-900 py-24">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Scale className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Legal</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="glass p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center glow-md flex-shrink-0">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using Festify, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center glow-md flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">2. Use License</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Permission is granted to temporarily access Festify for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software</li>
                  <li>Remove any copyright or proprietary notations</li>
                  <li>Transfer the materials to another person</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="glass p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. 
              Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for safeguarding the password and for all activities that occur under your account. 
              You agree not to disclose your password to any third party and to notify us immediately upon becoming aware of any breach of security.
            </p>
          </Card>

          <Card className="glass p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Event Registration & Payments</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All event registrations are subject to availability and confirmation. We reserve the right to refuse or cancel any registration at any time for any reason.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Payment processing is handled securely through third-party payment gateways. We do not store your complete payment information.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Refund policies are determined by individual event organizers. Please review the specific event's cancellation policy before registering.
            </p>
          </Card>

          <Card className="glass p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Event Organizers</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Event organizers are responsible for the accuracy of their event listings, including dates, times, venues, and pricing.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Organizers must comply with all applicable laws and regulations when hosting events. Festify is not responsible for the content or conduct of events listed on the platform.
            </p>
          </Card>

          <Card className="glass p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Content Guidelines</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Users agree not to post content that is:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Illegal, harmful, or offensive</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains malware or harmful code</li>
              <li>Violates privacy or confidentiality</li>
              <li>Misleading or fraudulent</li>
            </ul>
          </Card>

          <Card className="glass p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall Festify or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
              to use Festify, even if Festify or an authorized representative has been notified orally or in writing 
              of the possibility of such damage.
            </p>
          </Card>

          <Card className="glass p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of Festify is also governed by our Privacy Policy. Please review our Privacy Policy to 
              understand our practices regarding the collection and use of your personal information.
            </p>
          </Card>

          <Card className="glass p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes 
              via email or through the platform. Your continued use of Festify after such modifications constitutes 
              your acceptance of the updated terms.
            </p>
          </Card>

          <Card className="glass p-8">
            <h2 className="text-2xl font-bold mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: legal@festify.com<br />
              Phone: +91 1234567890<br />
              Address: SRM Institute, Chennai, India
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
