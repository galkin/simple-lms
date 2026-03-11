import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LessonPage from "./pages/LessonPage";
import NotFound from "./pages/NotFound.tsx";
import { allLessons } from "@/data/lessons";

const queryClient = new QueryClient();

function getFirstLessonSlug(): string {
  const sorted = [...allLessons].sort((a, b) => a.order - b.order);
  return sorted[0]?.slug || "";
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={`/lesson/${getFirstLessonSlug()}`} replace />} />
          <Route path="/lesson/:slug" element={<LessonPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
