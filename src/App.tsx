import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LessonPage from "./pages/LessonPage";
import NotFound from "./pages/NotFound.tsx";
import { lessons } from "#site/content";

function getFirstLessonSlug(): string {
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  return sorted[0]?.slug || "";
}

const AppLayout = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export const routes = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LessonPage defaultSlug={getFirstLessonSlug()} /> },
      {
        path: "lesson/:slug",
        element: <LessonPage />,
        getStaticPaths: () => lessons.map((lesson) => `/lesson/${lesson.slug}`),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
] as const;

export default AppLayout;
