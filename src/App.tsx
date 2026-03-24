/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Auth from "./components/Auth";
import { ThemeProvider } from "./components/ThemeProvider";
import { supabase } from "./lib/supabase";
import { Session } from "@supabase/supabase-js";
import TopProgressBar from "./components/TopProgressBar";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Buddy = lazy(() => import("./pages/Buddy"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const Progress = lazy(() => import("./pages/Progress"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ActiveWorkout = lazy(() => import("./pages/ActiveWorkout"));
const CreateRoutine = lazy(() => import("./pages/CreateRoutine"));
const Profile = lazy(() => import("./pages/Profile"));
const Marketplace = lazy(() => import("./pages/Marketplace"));

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(
    localStorage.getItem("onboardingComplete") === "true",
  );

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
        setOnboardingComplete(true);
      } else {
        localStorage.removeItem("onboardingComplete");
        setOnboardingComplete(false);
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN') {
        setLoading(true);
      }
      if (session) {
        checkProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setOnboardingComplete(localStorage.getItem("onboardingComplete") === "true");
    };
    window.addEventListener("onboardingUpdated", handleUpdate);
    return () => window.removeEventListener("onboardingUpdated", handleUpdate);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium animate-pulse">Đang tải dữ liệu...</p>
        </div>
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
        <TopProgressBar />
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium animate-pulse">Đang tải...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route 
              path="/onboarding" 
              element={onboardingComplete ? <Navigate to="/" replace /> : <Onboarding />} 
            />
            {!onboardingComplete && (
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            )}
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
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
