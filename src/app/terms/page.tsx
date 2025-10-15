
import { AuthHeader } from "@/components/layout/auth-header";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AuthHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-center sm:text-5xl lg:text-6xl">Terms of Service</h1>
            <p className="mt-6 text-xl text-muted-foreground text-center">
              Last updated: October 26, 2023
            </p>
            <div className="mt-12 prose prose-lg dark:prose-invert mx-auto">
              <p>This is a placeholder for your Terms of Service. It's crucial to have a legally sound document drafted for your specific application.</p>
              
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing or using DocuSync Lite (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use the Service.</p>

              <h2>2. Description of Service</h2>
              <p>DocuSync Lite provides users with document creation, synchronization, and collaboration tools. You understand and agree that the Service is provided "AS-IS" and that we assume no responsibility for the timeliness, deletion, mis-delivery, or failure to store any user communications or personalization settings.</p>

              <h2>3. User Conduct</h2>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Upload, post, email, transmit, or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable;</li>
                <li>Harm minors in any way;</li>
                <li>Impersonate any person or entity.</li>
              </ul>

              <h2>4. Termination</h2>
              <p>We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
              
              <h2>5. Governing Law</h2>
              <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company is based, without regard to its conflict of law provisions.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

    