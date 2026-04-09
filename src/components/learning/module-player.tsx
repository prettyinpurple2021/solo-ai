"use client";

import ReactMarkdown from "react-markdown";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Circle, ExternalLink } from "lucide-react";
import { parseLessonMedia } from "@/lib/learning/module-media";

interface Module {
  id: string;
  title: string;
  content: string;
  /** From `learning_modules.module_type`: article, video, quiz, etc. */
  module_type?: string;
  /** @deprecated Prefer `module_type` (matches DB column). */
  type?: string;
}

interface ModulePlayerProps {
  module: Module;
  onComplete: () => void;
  isCompleted?: boolean;
}

export function ModulePlayer({ module, onComplete, isCompleted = false }: ModulePlayerProps) {
  const moduleType = module.module_type ?? module.type;
  const media = parseLessonMedia(moduleType, module.content);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>{module.title}</CardTitle>
          {isCompleted ? (
            <div className="flex items-center text-green-500 text-sm font-medium">
              <CheckCircle className="w-5 h-5 mr-2" />
              Completed
            </div>
          ) : (
            <div className="flex items-center text-muted-foreground text-sm">
              <Circle className="w-5 h-5 mr-2" />
              In Progress
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full p-6">
          <div className="prose dark:prose-invert max-w-none space-y-6">
            {media.kind === "youtube" || media.kind === "vimeo" ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                <iframe
                  title={`Video: ${module.title}`}
                  src={media.embedUrl}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : null}

            {media.kind === "video" ? (
              <video
                className="w-full rounded-lg border border-border bg-black"
                controls
                playsInline
                preload="metadata"
                src={media.src}
              />
            ) : null}

            {media.kind === "external" ? (
              <p className="not-prose flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>This lesson links to an external video.</span>
                <a
                  href={media.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
                >
                  Open video
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </p>
            ) : null}

            {media.kind === "invalid" && moduleType?.toLowerCase() === "video" ? (
              <p className="not-prose text-sm text-muted-foreground" role="alert">
                Video URL is missing or invalid. Add a secure http(s) link in the lesson content.
              </p>
            ) : null}

            {media.kind === "markdown" ? (
              module.content.trim().length > 0 ? (
                <ReactMarkdown>{module.content}</ReactMarkdown>
              ) : (
                <p className="not-prose text-sm text-muted-foreground">
                  No written lesson content for this module yet.
                </p>
              )
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t p-4 flex justify-between bg-muted/20">
        <Button variant="ghost" disabled>
          Previous
        </Button>
        <Button onClick={onComplete} disabled={isCompleted}>
          {isCompleted ? "Completed" : "Mark as Complete"}
        </Button>
      </CardFooter>
    </Card>
  );
}
