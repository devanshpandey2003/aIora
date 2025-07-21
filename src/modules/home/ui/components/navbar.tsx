"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { UserControl } from "@/components/user-control";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

export const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToProjects = () => {
    const projectsSection = document.querySelector("#projects-section");
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const handleAboutClick = () => {
    toast.info("🚧 Coming Soon!", {
      description:
        "The About page is currently under development. Stay tuned for updates!",
      duration: 3000,
    });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Left side - Logo and brand */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-chart-2/30 rounded-xl blur-sm"></div>
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-chart-2 shadow-lg group-hover:scale-105 transition-transform">
                  <Image
                    src="/logo.svg"
                    alt="Alora"
                    width={20}
                    height={20}
                    className="shrink-0 filter drop-shadow-lg"
                  />
                </div>
              </div>
              <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                Alora
              </span>
            </Link>
          </div>

          {/* Center - Navigation links (hidden on mobile) - Absolutely centered */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Home
              </Link>
              <button
                onClick={scrollToProjects}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Projects
              </button>
              <button
                onClick={handleAboutClick}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                About
              </button>
            </div>
          </div>

          {/* Right side - Theme switcher and auth */}
          <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
            {/* Theme switcher */}
            <ThemeToggle />

            {/* Authentication buttons */}
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  Welcome, {user?.firstName || "User"}
                </span>
                <UserControl />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <SignInButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <MenuIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/30 py-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <button
                onClick={scrollToProjects}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2 text-left"
              >
                Projects
              </button>
              <button
                onClick={handleAboutClick}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2 text-left"
              >
                About
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
