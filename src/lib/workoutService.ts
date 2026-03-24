import { supabase } from './supabase';

export interface Workout {
  id?: string;
  user_id: string;
  name: string;
  start_time: string;
  end_time: string;
  duration: number;
  volume: number;
  sets_count: number;
}

export interface WorkoutExercise {
  id?: string;
  workout_id: string;
  user_id: string;
  exercise_name: string;
  note: string;
  order: number;
}

export interface WorkoutSet {
  id?: string;
  workout_exercise_id: string;
  workout_id: string;
  user_id: string;
  exercise_name: string;
  set_number: number;
  type: string;
  kg: number;
  reps: number;
  completed: boolean;
  is_record: boolean;
}

export const workoutService = {
  async saveWorkout(
    workout: Omit<Workout, 'id'>,
    exercises: Omit<WorkoutExercise, 'id' | 'workout_id'>[],
    sets: Omit<WorkoutSet, 'id' | 'workout_exercise_id' | 'workout_id'>[][]
  ) {
    try {
      // 1. Insert Workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert(workout)
        .select()
        .single();

      if (workoutError) throw workoutError;
      if (!workoutData) throw new Error('Failed to create workout');

      // 2. Insert Exercises
      const exercisesWithWorkoutId = exercises.map((ex) => ({
        ...ex,
        workout_id: workoutData.id,
      }));

      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesWithWorkoutId)
        .select();

      if (exercisesError) throw exercisesError;
      if (!exercisesData) throw new Error('Failed to create exercises');

      // 3. Insert Sets
      const allSetsToInsert: Omit<WorkoutSet, 'id'>[] = [];
      
      exercisesData.forEach((exData, index) => {
        const exerciseSets = sets[index];
        const setsWithIds = exerciseSets.map((set) => ({
          ...set,
          workout_exercise_id: exData.id,
          workout_id: workoutData.id,
        }));
        allSetsToInsert.push(...setsWithIds);
      });

      if (allSetsToInsert.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(allSetsToInsert);

        if (setsError) throw setsError;
      }

      return workoutData;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  },

  async checkIsNewRecord(userId: string, exerciseName: string, kg: number, reps: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('workout_sets')
        .select('reps')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .eq('kg', kg)
        .eq('completed', true)
        .order('reps', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        // First time doing this weight, so it's a record if reps > 0
        return reps > 0;
      }

      const maxReps = data[0].reps;
      return reps > maxReps;
    } catch (error) {
      console.error('Error checking record:', error);
      return false;
    }
  },

  async getExerciseRecords(userId: string, exerciseName: string) {
    try {
      const { data, error } = await supabase
        .from('workout_sets')
        .select('kg, reps')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .eq('completed', true)
        .order('kg', { ascending: false })
        .order('reps', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        return {
          maxKg: data[0].kg,
          reps: data[0].reps
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching exercise records:', error);
      return null;
    }
  },

  async getPreviousExerciseSets(userId: string, exerciseName: string) {
    try {
      // First find the most recent workout where this exercise was performed
      const { data: latestWorkout, error: workoutError } = await supabase
        .from('workout_sets')
        .select('workout_id')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .order('created_at', { ascending: false })
        .limit(1);

      if (workoutError) throw workoutError;

      if (latestWorkout && latestWorkout.length > 0) {
        const workoutId = latestWorkout[0].workout_id;
        
        // Then fetch all sets for this exercise from that specific workout
        const { data: sets, error: setsError } = await supabase
          .from('workout_sets')
          .select('kg, reps, set_type')
          .eq('user_id', userId)
          .eq('workout_id', workoutId)
          .eq('exercise_name', exerciseName)
          .order('created_at', { ascending: true });

        if (setsError) throw setsError;
        
        return sets || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching previous exercise sets:', error);
      return [];
    }
  },

  async getWorkoutHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            workout_sets (*)
          )
        `)
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workout history:', error);
      return [];
    }
  },

  async getRoutines(userId: string) {
    try {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching routines:', error);
      return [];
    }
  },

  async saveRoutine(routine: any) {
    try {
      const { data, error } = await supabase
        .from('routines')
        .upsert(routine)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving routine:', error);
      throw error;
    }
  },

  async deleteRoutine(routineId: string) {
    try {
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  },

  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async updateProfile(userId: string, profileData: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...profileData })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};
