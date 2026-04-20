import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Arena — Compare AI Models Side by Side",
  description: "Free, open-source playground to compare GPT-4o, Claude, Gemini, Mistral, Groq, and Ollama side by side. Self-hosted.",
  keywords: ["AI", "model comparison", "playground", "GPT-4o", "Claude", "Gemini", "Groq", "Ollama", "free", "open-source"],
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="hover:text-[hsl(var(--foreground))] transition-colors relative group">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300" />
    </a>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="min-h-screen flex flex-col">
            <nav className="sticky top-0 z-50 glass border-b border-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-shadow">AI</div>
                  <span className="font-bold text-lg">AI Arena</span>
                </a>
                <div className="hidden sm:flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
                  <NavLink href="/playground">Playground</NavLink>
                  <NavLink href="/templates">Templates</NavLink>
                  <NavLink href="/history">History</NavLink>
                  <NavLink href="/leaderboard">Leaderboard</NavLink>
                  <NavLink href="/settings">Settings</NavLink>
                </div>
                <a
                  href="https://github.com/enzoemir1/ai-arena-playground"
                  target="_blank"
                  rel="noopener"
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  GitHub
                </a>
              </div>
            </nav>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-white/5 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              <p>
                Built by{" "}
                <a href="https://automatiabcn.gumroad.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Automatia BCN
                </a>
                {" "} — Free & Open Source (MIT)
              </p>
              <p className="mt-2 text-xs opacity-60">
                Like comparing models? Check out{" "}
                <a href="https://automatiabcn.gumroad.com/l/cacheflow-ai" className="underline hover:text-purple-400">
                  CacheFlow AI
                </a>
                {" "}to optimize costs in production ($79).
              </p>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
