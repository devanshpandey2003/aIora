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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDownIcon,
  SettingsIcon,
  ShareIcon,
  DownloadIcon,
  TrashIcon,
  MoreHorizontalIcon,
  FolderIcon,
  GlobeIcon,
  LockIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectHeaderProps {
  projectName: string;
  projectId: string;
  isPublic?: boolean;
  lastModified?: Date;
  onShare?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
}

export const ProjectHeader = ({
  projectName,
  projectId,
  isPublic = false,
  lastModified,
  onShare,
  onDownload,
  onDelete,
  onToggleVisibility,
}: ProjectHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(projectName);
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
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to system theme if no preference saved
      applyTheme("system");
    }
  }, []);

  const applyTheme = (theme: "light" | "dark" | "system") => {
    const html = document.documentElement;

    if (theme === "light") {
      html.classList.remove("dark");
    } else if (theme === "dark") {
      html.classList.add("dark");
    } else {
      // system
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setCurrentTheme(theme);
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  };

  const handleNameSave = () => {
    setIsEditing(false);
    // TODO: Add API call to save the name
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
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Project name dropdown */}
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
              <Image
                src="/logo.svg"
                alt="Alora"
                width={16}
                height={16}
                className="shrink-0"
              />
            </div>

            {/* Project name dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0 h-auto"
                >
                  {projectName}
                  <ChevronDownIcon className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {projectName}
                  </div>
                  {lastModified && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Modified {formatLastModified(lastModified)}
                    </div>
                  )}
                </div>

                <DropdownMenuItem
                  onClick={onShare}
                  className="flex items-center gap-2"
                >
                  <ShareIcon className="w-4 h-4" />
                  Share Project
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onDownload}
                  className="flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download Project
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onToggleVisibility}
                  className="flex items-center gap-2"
                >
                  {isPublic ? (
                    <>
                      <LockIcon className="w-4 h-4" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <GlobeIcon className="w-4 h-4" />
                      Make Public
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <SunIcon className="w-4 h-4" />
                    Appearance
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => handleThemeChange("light")}
                      className={`flex items-center gap-2 ${
                        currentTheme === "light"
                          ? "bg-gray-100 dark:bg-gray-800"
                          : ""
                      }`}
                    >
                      <SunIcon className="w-4 h-4" />
                      Light
                      {currentTheme === "light" && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleThemeChange("dark")}
                      className={`flex items-center gap-2 ${
                        currentTheme === "dark"
                          ? "bg-gray-100 dark:bg-gray-800"
                          : ""
                      }`}
                    >
                      <MoonIcon className="w-4 h-4" />
                      Dark
                      {currentTheme === "dark" && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleThemeChange("system")}
                      className={`flex items-center gap-2 ${
                        currentTheme === "system"
                          ? "bg-gray-100 dark:bg-gray-800"
                          : ""
                      }`}
                    >
                      <MonitorIcon className="w-4 h-4" />
                      System
                      {currentTheme === "system" && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Project Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={onDelete}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side - Back button */}
          <Link href="/projects">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <svg
                width="14"
                height="14"
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
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
