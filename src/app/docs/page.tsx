
import { AuthHeader } from "@/components/layout/auth-header";

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AuthHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-center sm:text-5xl lg:text-6xl">Documentation</h1>
            <p className="mt-6 text-xl text-muted-foreground text-center">
              Welcome to the DocuSync Lite documentation.
            </p>
            <div className="mt-12 prose prose-lg dark:prose-invert mx-auto">
                <p>This is a placeholder for your documentation page. Here, you would provide comprehensive guides, API references, and tutorials to help your users get the most out of DocuSync Lite.</p>
                
                <h2>Getting Started</h2>
                <p>A "Getting Started" guide is essential. It should walk a new user through setting up their account, creating their first document, and inviting team members.</p>

                <h2>Core Features</h2>
                <p>Detail each of your core features:</p>
                <ul>
                    <li>Real-time Collaboration</li>
                    <li>DocuSync Sync Engine</li>
                    <li>Smart Document Structuring</li>
                    <li>AI Smart Suggestions</li>
                    <li>Version Control</li>
                </ul>

                <h2>API Reference</h2>
                <p>If your product has an API, this is where you would document all the available endpoints, parameters, and authentication methods. Clear examples are key to a good developer experience.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

    