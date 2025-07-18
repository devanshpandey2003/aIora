import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
                      onClick={() => {
                        document.documentElement.classList.remove("dark");
                        localStorage.setItem("theme", "light");
                      }}
                      className="flex items-center gap-2"
                    >
                      <SunIcon className="w-4 h-4" />
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        document.documentElement.classList.add("dark");
                        localStorage.setItem("theme", "dark");
                      }}
                      className="flex items-center gap-2"
                    >
                      <MoonIcon className="w-4 h-4" />
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (
                          window.matchMedia("(prefers-color-scheme: dark)")
                            .matches
                        ) {
                          document.documentElement.classList.add("dark");
                        } else {
                          document.documentElement.classList.remove("dark");
                        }
                        localStorage.setItem("theme", "system");
                      }}
                      className="flex items-center gap-2"
                    >
                      <MonitorIcon className="w-4 h-4" />
                      System
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
