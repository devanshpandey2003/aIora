"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  SunIcon,
  MoonIcon,
  MonitorIcon,
  ChevronDownIcon,
  MenuIcon,
} from "lucide-react";

export const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "system">(
    "system"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Apply saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "system"
      | null;

    const initialTheme = savedTheme || "system";
    setCurrentTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (theme: "light" | "dark" | "system") => {
    const html = document.documentElement;

    if (theme === "light") {
      html.classList.remove("dark");
    } else if (theme === "dark") {
      html.classList.add("dark");
    } else {
      // system
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    console.log("🎨 Theme changing from", currentTheme, "to", theme);

    setCurrentTheme(theme);
    localStorage.setItem("theme", theme);
    setShowThemeOptions(false);

    // Apply theme immediately
    const html = document.documentElement;

    if (theme === "light") {
      html.classList.remove("dark");
      console.log("☀️ Applied light theme, dark class removed");
    } else if (theme === "dark") {
      html.classList.add("dark");
      console.log("🌙 Applied dark theme, dark class added");
    } else {
      // system
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        html.classList.add("dark");
        console.log("🖥️ Applied system theme (dark), dark class added");
      } else {
        html.classList.remove("dark");
        console.log("🖥️ Applied system theme (light), dark class removed");
      }
    }

    console.log("📱 Current HTML classes:", html.className);
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case "light":
        return <SunIcon className="w-4 h-4" />;
      case "dark":
        return <MoonIcon className="w-4 h-4" />;
      default:
        return <MonitorIcon className="w-4 h-4" />;
    }
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
              <Link
                href="/projects"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Projects
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                About
              </Link>
            </div>
          </div>

          {/* Right side - Theme switcher and auth */}
          <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
            {/* Theme switcher */}
            <DropdownMenu
              open={showThemeOptions}
              onOpenChange={setShowThemeOptions}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {getThemeIcon()}
                  <span className="hidden sm:inline capitalize">
                    {currentTheme}
                  </span>
                  <ChevronDownIcon className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card/95 backdrop-blur-sm border-border/60"
              >
                <DropdownMenuItem
                  onSelect={() => handleThemeChange("light")}
                  className={`flex items-center gap-3 py-2 ${
                    currentTheme === "light" ? "bg-accent/70" : ""
                  }`}
                >
                  <SunIcon className="w-4 h-4" />
                  Light
                  {currentTheme === "light" && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleThemeChange("dark")}
                  className={`flex items-center gap-3 py-2 ${
                    currentTheme === "dark" ? "bg-accent/70" : ""
                  }`}
                >
                  <MoonIcon className="w-4 h-4" />
                  Dark
                  {currentTheme === "dark" && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleThemeChange("system")}
                  className={`flex items-center gap-3 py-2 ${
                    currentTheme === "system" ? "bg-accent/70" : ""
                  }`}
                >
                  <MonitorIcon className="w-4 h-4" />
                  System
                  {currentTheme === "system" && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Authentication buttons */}
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  Welcome, {user?.firstName || "User"}
                </span>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-8 h-8 rounded-full border-2 border-border hover:border-primary transition-colors",
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
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
              <Link
                href="/projects"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
