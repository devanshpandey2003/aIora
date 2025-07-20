"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";

export const ProjectList = () => {
  const trpc = useTRPC();
  const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());

  return (
    <div className="w-full bg-card/60 backdrop-blur-sm rounded-2xl border border-border/60 flex flex-col gap-y-6 sm:gap-y-4 p-8 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-2 h-8 bg-gradient-to-b from-primary to-chart-2 rounded-full"></div>
        <h2 className="text-2xl font-bold text-foreground">Saved Projects</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                No Projects Yet
              </p>
              <p className="text-sm text-muted-foreground/60">
                Create your first project to get started
              </p>
            </div>
          </div>
        )}
        {projects?.map((project) => (
          <Button
            key={project.id}
            variant="outline"
            asChild
            className="bg-card/80 backdrop-blur-sm border-border/60 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 h-auto hover:scale-[1.02] hover:border-primary/30 group"
          >
            <Link href={`/projects/${project.id}`}>
              <div className="flex items-center gap-4 w-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-2/20 rounded-full blur-sm"></div>
                  <Image
                    src="/logo.svg"
                    alt="Project"
                    width={40}
                    height={40}
                    className="relative z-10 object-contain flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate w-full group-hover:text-primary transition-colors duration-200">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(project.updatedAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};
