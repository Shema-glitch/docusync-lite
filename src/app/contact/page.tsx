
import { AuthHeader } from "@/components/layout/auth-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AuthHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Contact Us</h1>
              <p className="mt-6 text-xl text-muted-foreground">
                Have a question or want to learn more? We'd love to hear from you.
              </p>
            </div>
            <form className="mt-12 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" type="text" placeholder="Your Name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="How can we help?" required rows={5} />
              </div>
              <Button type="submit" className="w-full" disabled>Submit</Button>
               <p className="text-center text-sm text-muted-foreground">
                This form is for demonstration purposes. Please use the demo request for inquiries.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

    