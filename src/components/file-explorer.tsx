"use client";

import React, { useState, useMemo } from "react";
import {
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  ChevronRightIcon,
  HomeIcon,
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon,
  FileTextIcon,
  CodeIcon,
  ImageIcon,
  SettingsIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CodeView } from "@/components/code-view";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  modified?: Date;
  children?: FileNode[];
  extension?: string;
  path: string;
}

interface Props {
  files: FileNode[];
  filesContent?: { [path: string]: string }; // File contents for code view
  onFileSelect?: (file: FileNode) => void;
  onFolderToggle?: (folder: FileNode) => void;
  selectedFile?: string;
  className?: string;
}

export const FileExplorer = ({
  files,
  filesContent = {},
  onFileSelect,
  onFolderToggle,
  className = "",
}: Props) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [currentPath, setCurrentPath] = useState<string[]>([""]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [selectedFileContent, setSelectedFileContent] =
    useState<FileNode | null>(null);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [activeFileTab, setActiveFileTab] = useState<string>("");

  // Build folder structure from flat file list
  const buildFolderStructure = (flatFiles: FileNode[]): FileNode[] => {
    const structure: { [path: string]: FileNode } = {};
    const result: FileNode[] = [];

    // First pass: create all nodes
    flatFiles.forEach((file) => {
      const pathParts = file.path.split("/").filter(Boolean);

      // Create folder nodes for each path segment
      for (let i = 0; i < pathParts.length; i++) {
        const currentPath = pathParts.slice(0, i + 1).join("/");
        const isFile = i === pathParts.length - 1;

        if (!structure[currentPath]) {
          structure[currentPath] = {
            id: currentPath,
            name: pathParts[i],
            type: isFile ? "file" : "folder",
            path: currentPath,
            extension: isFile ? file.extension : undefined,
            size: isFile ? file.size : undefined,
            modified: isFile ? file.modified : new Date(),
            children: isFile ? undefined : [],
          };
        }
      }
    });

    // Second pass: build hierarchy
    Object.values(structure).forEach((node) => {
      const pathParts = node.path.split("/").filter(Boolean);

      if (pathParts.length === 1) {
        // Root level
        result.push(node);
      } else {
        // Find parent and add as child
        const parentPath = pathParts.slice(0, -1).join("/");
        const parent = structure[parentPath];
        if (parent && parent.children) {
          parent.children.push(node);
        }
      }
    });

    return result;
  };

  const structuredFiles = buildFolderStructure(files);

  const getFileIcon = (file: FileNode) => {
    if (file.type === "folder") {
      return expandedFolders.has(file.id) ? (
        <FolderOpenIcon className="w-4 h-4 text-blue-500" />
      ) : (
        <FolderIcon className="w-4 h-4 text-blue-500" />
      );
    }

    // File type icons based on extension
    const extension = file.extension?.toLowerCase();
    switch (extension) {
      case "tsx":
        return <CodeIcon className="w-4 h-4 text-blue-400" />;
      case "ts":
        return <CodeIcon className="w-4 h-4 text-blue-600" />;
      case "jsx":
        return <CodeIcon className="w-4 h-4 text-yellow-400" />;
      case "js":
        return <CodeIcon className="w-4 h-4 text-yellow-500" />;
      case "css":
        return <FileTextIcon className="w-4 h-4 text-blue-500" />;
      case "scss":
      case "sass":
        return <FileTextIcon className="w-4 h-4 text-pink-500" />;
      case "html":
        return <FileTextIcon className="w-4 h-4 text-orange-500" />;
      case "json":
        return <SettingsIcon className="w-4 h-4 text-green-500" />;
      case "md":
        return <FileTextIcon className="w-4 h-4 text-gray-600" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return <ImageIcon className="w-4 h-4 text-purple-500" />;
      case "xml":
        return <FileTextIcon className="w-4 h-4 text-red-500" />;
      case "yml":
      case "yaml":
        return <SettingsIcon className="w-4 h-4 text-gray-500" />;
      case "txt":
        return <FileTextIcon className="w-4 h-4 text-gray-500" />;
      case "pdf":
        return <FileIcon className="w-4 h-4 text-red-600" />;
      default:
        return <FileIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const toggleFolder = (folder: FileNode) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folder.id)) {
      newExpanded.delete(folder.id);
    } else {
      newExpanded.add(folder.id);
    }
    setExpandedFolders(newExpanded);
    onFolderToggle?.(folder);
  };

  const handleFileClick = (file: FileNode) => {
    console.log("FileExplorer - File clicked:", file);
    console.log("FileExplorer - Files content:", filesContent);
    console.log(
      "FileExplorer - File content for path:",
      file.path,
      "=",
      filesContent[file.path]
    );

    if (file.type === "folder") {
      toggleFolder(file);
      // Update breadcrumb path
      const pathSegments = file.path.split("/").filter(Boolean);
      setCurrentPath(["", ...pathSegments]);
    } else {
      // Find the original file from the flat files array for content lookup
      const originalFile = files.find((f) => f.path === file.path) || file;

      // Add to open files if not already open
      if (!openFiles.some((f) => f.path === originalFile.path)) {
        setOpenFiles((prev) => [...prev, originalFile]);
      }

      // Set as active tab
      setActiveFileTab(originalFile.path);
      setSelectedFileContent(originalFile);
      onFileSelect?.(originalFile);
    }
  };

  const handleFileRemove = (filePath: string) => {
    setOpenFiles((prev) => prev.filter((f) => f.path !== filePath));

    // If removing the active file, switch to another open file
    if (activeFileTab === filePath) {
      const remainingFiles = openFiles.filter((f) => f.path !== filePath);
      if (remainingFiles.length > 0) {
        const newActiveFile = remainingFiles[remainingFiles.length - 1];
        setActiveFileTab(newActiveFile.path);
        setSelectedFileContent(newActiveFile);
        onFileSelect?.(newActiveFile);
      } else {
        setActiveFileTab("");
        setSelectedFileContent(null);
      }
    }
  };

  const handleTabChange = (filePath: string) => {
    const file = openFiles.find((f) => f.path === filePath);
    if (file) {
      setActiveFileTab(filePath);
      setSelectedFileContent(file);
      onFileSelect?.(file);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (date?: Date): string => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return structuredFiles;

    const filterFiles = (nodes: FileNode[]): FileNode[] => {
      return nodes.reduce((acc: FileNode[], node) => {
        const matchesSearch = node.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        if (node.type === "folder" && node.children) {
          const filteredChildren = filterFiles(node.children);
          if (filteredChildren.length > 0 || matchesSearch) {
            acc.push({
              ...node,
              children: filteredChildren,
            });
          }
        } else if (matchesSearch) {
          acc.push(node);
        }

        return acc;
      }, []);
    };

    return filterFiles(structuredFiles);
  }, [structuredFiles, searchQuery]);

  const renderTreeNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFileContent?.id === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-sm ${
            isSelected ? "bg-blue-100 dark:bg-blue-900/30" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          {node.type === "folder" && (
            <ChevronRightIcon
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          )}
          {getFileIcon(node)}
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
            {node.name}
          </span>
          {node.type === "file" && node.size && (
            <span className="text-xs text-gray-500">
              {formatFileSize(node.size)}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVerticalIcon className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Copy</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
              {node.type === "file" && (
                <DropdownMenuItem>Download</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderListView = () => {
    const flattenFiles = (nodes: FileNode[]): FileNode[] => {
      return nodes.reduce((acc: FileNode[], node) => {
        acc.push(node);
        if (
          node.type === "folder" &&
          node.children &&
          expandedFolders.has(node.id)
        ) {
          acc.push(...flattenFiles(node.children));
        }
        return acc;
      }, []);
    };

    const flatFiles = flattenFiles(filteredFiles);

    return (
      <div className="space-y-1">
        {flatFiles.map((file) => (
          <div
            key={file.id}
            className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-sm group ${
              selectedFileContent?.id === file.id
                ? "bg-blue-100 dark:bg-blue-900/30"
                : ""
            }`}
            onClick={() => handleFileClick(file)}
          >
            {getFileIcon(file)}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {file.name}
              </div>
              <div className="text-xs text-gray-500 truncate">{file.path}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {file.size && <span>{formatFileSize(file.size)}</span>}
              {file.modified && <span>{formatDate(file.modified)}</span>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVerticalIcon className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem>Copy</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
                {file.type === "file" && (
                  <DropdownMenuItem>Download</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    );
  };

  const breadcrumbItems = currentPath.map((segment, index) => {
    if (index === 0) {
      return (
        <BreadcrumbItem key="home">
          <BreadcrumbLink href="#" className="flex items-center gap-1">
            <HomeIcon className="w-4 h-4" />
            Project
          </BreadcrumbLink>
        </BreadcrumbItem>
      );
    }

    const isLast = index === currentPath.length - 1;
    return (
      <React.Fragment key={segment}>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {isLast ? (
            <BreadcrumbPage>{segment}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href="#">{segment}</BreadcrumbLink>
          )}
        </BreadcrumbItem>
      </React.Fragment>
    );
  });

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={`h-full ${className}`}
    >
      {/* File Tree Panel */}
      <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-l-lg">
          {/* Header */}
          <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700">
            {/* Breadcrumb Navigation */}
            <div className="mb-3">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbItems}
                  {currentPath.length > 3 && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbEllipsis className="h-4 w-4" />
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "tree" ? "list" : "tree")
                }
                className="h-8"
              >
                <FilterIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* File Stats */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {filteredFiles.length} items
              </Badge>
              {searchQuery && (
                <Badge variant="outline" className="text-xs">
                  Filtered
                </Badge>
              )}
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-auto p-2">
            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <FileIcon className="w-8 h-8 mb-2" />
                <p className="text-sm">
                  {searchQuery
                    ? "No files match your search"
                    : "No files found"}
                </p>
              </div>
            ) : viewMode === "tree" ? (
              <div className="space-y-1">
                {filteredFiles.map((file) => renderTreeNode(file))}
              </div>
            ) : (
              renderListView()
            )}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Code Preview Panel */}
      <ResizablePanel defaultSize={75} minSize={50}>
        <div className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-r-lg overflow-hidden">
          {openFiles.length > 0 ? (
            <CodeView
              files={openFiles.map((file) => ({
                name: file.path, // Use full path instead of just name
                content:
                  filesContent[file.path] ||
                  `// No content available for ${file.name}\n// Path: ${file.path}`,
                language: file.extension || "text",
              }))}
              activeFile={activeFileTab}
              theme="dark"
              showLineNumbers={true}
              className="h-full"
              maxHeight="100%"
              onFileChange={handleTabChange}
              onFileRemove={handleFileRemove}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
              <CodeIcon className="w-16 h-16 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">
                Select a fragment to view code
              </h3>
              <p className="text-sm text-center max-w-md">
                Choose a fragment from the chat to see its code files
              </p>
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default FileExplorer;
