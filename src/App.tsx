/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Buddy from "./pages/Buddy";
import Nutrition from "./pages/Nutrition";
import Progress from "./pages/Progress";
import Onboarding from "./pages/Onboarding";
import ActiveWorkout from "./pages/ActiveWorkout";
import CreateRoutine from "./pages/CreateRoutine";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";
import Auth from "./components/Auth";
import { ThemeProvider } from "./components/ThemeProvider";
import { supabase } from "./lib/supabase";
import { Session } from "@supabase/supabase-js";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const checkProfile = async (userId: string) => {
    setCheckingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('goals, weight, height')
        .eq('id', userId)
        .single();
      
      if (data && (data.goals || data.weight || data.height)) {
        localStorage.setItem("onboardingComplete", "true");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingProfile(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="buddy" element={<Buddy />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="progress" element={<Progress />} />
            <Route path="marketplace" element={<Marketplace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
