"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDownIcon,
  SettingsIcon,
  DownloadIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
} from "lucide-react";

interface ProjectHeaderProps {
  projectName: string;
  projectId: string;
  lastModified?: Date;

  onDownload?: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
}

export const ProjectHeader = ({
  projectName,
  lastModified,
  onDownload,
  onDelete,
}: ProjectHeaderProps) => {
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "system">(
    "system"
  );

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
    setShowThemeOptions(false); // Close theme options

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

  const formatLastModified = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Project name dropdown */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-chart-2/30 rounded-xl blur-sm"></div>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-chart-2 shadow-lg">
                <Image
                  src="/logo.svg"
                  alt="Vibe"
                  width={20}
                  height={20}
                  className="shrink-0 filter brightness-0 invert"
                />
              </div>
            </div>

            {/* Project name dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-xl font-bold text-foreground hover:text-primary transition-colors p-0 h-auto group"
                >
                  {projectName}
                  <ChevronDownIcon className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-64 bg-card/95 backdrop-blur-sm border-border/60"
              >
                <div className="px-4 py-3 border-b border-border/50">
                  <div className="font-semibold text-base text-foreground">
                    {projectName}
                  </div>
                  {lastModified && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Modified {formatLastModified(lastModified)}
                    </div>
                  )}
                </div>

                <DropdownMenuItem
                  onClick={onDownload}
                  className="flex items-center gap-3 py-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="p-1 rounded-md bg-chart-2/10">
                    <DownloadIcon className="w-4 h-4 text-chart-2" />
                  </div>
                  Download Project
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/30" />

                {!showThemeOptions ? (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowThemeOptions(true);
                    }}
                    className="flex items-center gap-3 py-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="p-1 rounded-md bg-chart-4/10">
                      <SunIcon className="w-4 h-4 text-chart-4" />
                    </div>
                    Appearance
                    <ChevronDownIcon className="w-4 h-4 ml-auto" />
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setShowThemeOptions(false);
                      }}
                      className="flex items-center gap-3 py-3 hover:bg-accent/50 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      Back
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleThemeChange("light")}
                      className={`flex items-center gap-3 py-3 hover:bg-accent/50 transition-colors ${
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
                      className={`flex items-center gap-3 py-3 hover:bg-accent/50 transition-colors ${
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
                      className={`flex items-center gap-3 py-3 hover:bg-accent/50 transition-colors ${
                        currentTheme === "system" ? "bg-accent/70" : ""
                      }`}
                    >
                      <MonitorIcon className="w-4 h-4" />
                      System
                      {currentTheme === "system" && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuItem className="flex items-center gap-3 py-3 hover:bg-accent/50 transition-colors">
                  <div className="p-1 rounded-md bg-muted">
                    <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  Project Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/30" />

                <DropdownMenuItem
                  onClick={onDelete}
                  className="flex items-center gap-3 py-3 text-destructive hover:bg-destructive/10 focus:text-destructive transition-colors"
                >
                  <div className="p-1 rounded-md bg-destructive/10">
                    <TrashIcon className="w-4 h-4" />
                  </div>
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side - Back button */}
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-card/60 border-border/60 hover:bg-accent/80 hover:border-accent-foreground/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:-translate-x-1"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
