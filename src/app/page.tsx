import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    step: "01",
    title: "Upload Your CV",
    description:
      "Snap a photo, upload an image, or select a PDF. Our AI reads and structures your entire resume in seconds.",
  },
  {
    step: "02",
    title: "Find Matching Jobs",
    description:
      "We search thousands of listings across major job boards and rank them by how well they fit your profile.",
  },
  {
    step: "03",
    title: "Optimize & Apply",
    description:
      "Your CV is rewritten with the exact keywords ATS systems scan for — then download the PDF and apply.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center px-5 pt-20 pb-16 sm:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            AI-Powered CV Optimization
          </p>

          <h1 className="mb-6 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
            Land the job you deserve
          </h1>

          <p className="mx-auto mb-10 max-w-md text-lg leading-relaxed text-muted-foreground">
            Upload your CV. We find matching jobs and tailor your resume to pass
            ATS filters — so your application actually gets seen.
          </p>

          <Link href="/upload">
            <Button
              size="lg"
              className="h-13 rounded-full bg-foreground px-10 text-base font-semibold text-background transition-all hover:opacity-90"
            >
              Get Started
            </Button>
          </Link>
        </div>

        {/* How it works */}
        <div className="mx-auto mt-24 w-full max-w-3xl">
          <h2 className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.step} className="text-center sm:text-left">
                <p className="mb-2 font-[family-name:var(--font-heading)] text-3xl font-light text-border sm:text-4xl">
                  {feature.step}
                </p>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        ATS CV Optimizer &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
