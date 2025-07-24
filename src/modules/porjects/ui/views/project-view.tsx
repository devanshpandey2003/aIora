"use client";

import { useTRPC } from "@/trpc/client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { MessageContainer } from "../components/message-container";

import { Fragment } from "@/generated/prisma";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Suspense, useState } from "react";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragement_web";
import { CodeView } from "@/components/code-view";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FileExplorer from "@/components/file-explorer";
import { UserControl } from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro" });

  const trpc = useTRPC();

  const [tabState, setTabState] = useState<"preview" | "code">("preview");

  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({
      id: projectId,
    })
  );

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <div className="flex-shrink-0">
            <ErrorBoundary fallback={<p>Error loading project header!</p>}>
              <Suspense fallback={<p>Loading project...</p>}>
                <ProjectHeader
                  projectName={project.name}
                  projectId={projectId}
                  lastModified={project.updatedAt}
                  onShare={() => {
                    // TODO: Implement share functionality
                    console.log("Share project:", projectId);
                  }}
                  onDownload={() => {
                    // TODO: Implement download functionality
                    console.log("Download project:", projectId);
                  }}
                  onDelete={() => {
                    // TODO: Implement delete functionality
                    console.log("Delete project:", projectId);
                  }}
                  onToggleVisibility={() => {
                    // TODO: Implement visibility toggle
                    console.log("Toggle visibility for project:", projectId);
                  }}
                />
              </Suspense>
            </ErrorBoundary>
          </div>

          <div className="flex-1 min-h-0">
            <ErrorBoundary fallback={<p>Error loading messages!</p>}>
              <Suspense fallback={<p>Loading messages...</p>}>
                <MessageContainer
                  activeFragment={activeFragment}
                  setActiveFragment={setActiveFragment}
                  projectId={projectId}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={65} minSize={50}>
          <Tabs
            value={tabState}
            defaultValue="preview"
            onValueChange={(value) => setTabState(value as "preview" | "code")}
            className="h-full flex flex-col"
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2 flex-shrink-0">
              <TabsList className="flex-1 h-8 p-0 border rounded-md">
                <TabsTrigger value="preview">
                  <EyeIcon className="w-4 h-4" />
                  <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code">
                  <CodeIcon className="w-4 h-4" />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>

              <div className="ml-auto flex items-center gap-x-2">
                {!hasProAccess && (
                  <Button asChild size="sm" variant="default">
                    <Link href="/pricing">
                      <CrownIcon className="w-4 h-4" />
                      Upgrade
                    </Link>
                  </Button>
                )}
                <UserControl />
              </div>
            </div>

            <TabsContent value="preview" className="flex-1 m-0 p-0">
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>

            <TabsContent value="code" className="flex-1 m-0 p-0">
              {!!activeFragment?.files ? (
                <FileExplorer
                  files={Object.entries(
                    activeFragment.files as { [path: string]: string }
                  ).map(([path, content]) => ({
                    id: path,
                    name: path.split("/").pop() || path,
                    type: "file" as const,
                    path: path,
                    extension: path.split(".").pop(),
                    size: content.length,
                    modified: new Date(),
                  }))}
                  filesContent={
                    activeFragment.files as { [path: string]: string }
                  }
                  onFileSelect={(file) => console.log("Selected file:", file)}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a fragment to view its code
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
