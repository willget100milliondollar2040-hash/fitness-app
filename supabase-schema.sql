-- Supabase Schema for Workout Tracker

-- Create workouts table
CREATE TABLE workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL,
    volume NUMERIC NOT NULL,
    sets_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_exercises table
CREATE TABLE workout_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exercise_name TEXT NOT NULL,
    note TEXT,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_sets table
CREATE TABLE workout_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE NOT NULL,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exercise_name TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    type TEXT NOT NULL,
    kg NUMERIC NOT NULL,
    reps INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    is_record BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own workout_exercises" ON workout_exercises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workout_exercises" ON workout_exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workout_exercises" ON workout_exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workout_exercises" ON workout_exercises FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own workout_sets" ON workout_sets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workout_sets" ON workout_sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workout_sets" ON workout_sets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workout_sets" ON workout_sets FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_workout_sets_workout_exercise_id ON workout_sets(workout_exercise_id);
CREATE INDEX idx_workout_sets_user_exercise ON workout_sets(user_id, exercise_name);
