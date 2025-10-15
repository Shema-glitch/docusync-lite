
import { AuthHeader } from "@/components/layout/auth-header";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AuthHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-center sm:text-5xl lg:text-6xl">About DocuSync Lite</h1>
            <p className="mt-6 text-xl text-muted-foreground text-center">
              Our mission is to empower teams to create, sync, and collaborate with effortless precision.
            </p>
            <div className="mt-12 prose prose-lg dark:prose-invert mx-auto">
              <p>
                DocuSync Lite was born from a simple idea: documentation and collaboration shouldn't be complicated. In a world of bloated software and disjointed workflows, we saw the need for a tool that was powerful yet intuitive, fast yet reliable.
              </p>
              <p>
                We are a team of developers, designers, and thinkers passionate about productivity and clean design. We believe that the right tools can unlock a team's full potential, allowing great ideas to flow freely without being hindered by friction.
              </p>
              <p>
                Our core focus is on three pillars:
              </p>
              <ul>
                <li><strong>Real-time Syncing:</strong> Our proprietary DocuSync Engine ensures that your work is always up-to-date, across all your devices, even when you're offline.</li>
                <li><strong>Intuitive Design:</strong> We've crafted an interface that gets out of your way, letting you focus on what truly matters—your content.</li>
                <li><strong>Enterprise-Grade Security:</strong> Your data is your most valuable asset. We protect it with end-to-end encryption and robust security protocols.</li>
              </ul>
              <p>
                We're just getting started. Join us on our journey to build the future of documentation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

    