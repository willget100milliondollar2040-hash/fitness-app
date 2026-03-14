/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Coach from "./pages/Coach";
import Buddy from "./pages/Buddy";
import Nutrition from "./pages/Nutrition";
import Progress from "./pages/Progress";
import Onboarding from "./pages/Onboarding";
import ActiveWorkout from "./pages/ActiveWorkout";
import CreateRoutine from "./pages/CreateRoutine";
import Auth from "./components/Auth";
import { ThemeProvider } from "./components/ThemeProvider";
import { supabase } from "./lib/supabase";
import { Session } from "@supabase/supabase-js";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-black p-6 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-white">Cấu hình Supabase chưa hoàn tất</h1>
            <p className="text-zinc-400">Vui lòng thiết lập VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong phần Settings để bắt đầu.</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!session) {
    return (
      <ThemeProvider>
        <Auth />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/workout/:id" element={<ActiveWorkout />} />
          <Route path="/routine/new" element={<CreateRoutine />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="coach" element={<Coach />} />
            <Route path="buddy" element={<Buddy />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="progress" element={<Progress />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
