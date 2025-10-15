
import { AuthHeader } from "@/components/layout/auth-header";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AuthHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-center sm:text-5xl lg:text-6xl">Privacy Policy</h1>
            <p className="mt-6 text-xl text-muted-foreground text-center">
              Last updated: October 26, 2023
            </p>
            <div className="mt-12 prose prose-lg dark:prose-invert mx-auto">
                <p>This is a placeholder for your Privacy Policy. In a real application, you would detail how you collect, use, and protect your users' data.</p>
                
                <h2>1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, join the waitlist, or communicate with us. This may include your name, email address, and any other information you choose to provide.</p>

                <h2>2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                    <li>Provide, maintain, and improve our services;</li>
                    <li>Communicate with you, including to send you updates and marketing materials (where permitted);</li>
                    <li>Respond to your comments, questions, and requests;</li>
                    <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
                </ul>

                <h2>3. Sharing of Information</h2>
                <p>We do not share your personal information with third parties except as described in this Privacy Policy or with your consent.</p>

                <h2>4. Your Choices</h2>
                <p>You may update, correct, or delete information about you at any time by logging into your account or contacting us. If you wish to delete your account, please email us, but note that we may retain certain information as required by law or for legitimate business purposes.</p>

                <h2>5. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at privacy@docusync.lite.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

    