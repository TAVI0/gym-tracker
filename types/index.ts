// ===== ENTIDADES DE BASE DE DATOS =====

export interface MuscleGroup {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Exercise {
  id: number;
  name: string;
  muscle_group_id: number;
  description?: string;
  instructions?: string;
  created_at: string;
}

export interface Workout {
  id: number;
  name: string;
  muscle_group_id: number;
  date: string; // YYYY-MM-DD format
  notes?: string;
  is_completed: boolean;
  created_at: string;
}

export interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_id: number;
  is_completed: boolean;
  sets?: number;
  reps?: number;
  weight?: number; // en kg
  notes?: string;
  created_at: string;
}
// ===== TIPOS PARA CREACIÓN (sin id y created_at) =====

export interface CreateMuscleGroup {
  name: string;
  description?: string;
}

export interface CreateExercise {
  name: string;
  muscle_group_id: number;
  description?: string;
  instructions?: string;
}

export interface CreateWorkout {
  name: string;
  muscle_group_id: number;
  date: string;
  notes?: string;
}

export interface CreateWorkoutExercise {
  workout_id: number;
  exercise_id: number;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
}

// ===== TIPOS UTILITARIOS =====

export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Para joins entre ejercicios y grupos musculares
export interface ExerciseWithGroup extends Exercise {
  group_name: string;
  group_description?: string;
}

// Workout con información del grupo muscular
export interface WorkoutWithGroup extends Workout {
  group_name: string;
  group_description?: string;
}

// WorkoutExercise con información del ejercicio
export interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercise_name: string;
  exercise_description?: string;
  exercise_instructions?: string;
}

// Workout completo con ejercicios
export interface WorkoutComplete extends WorkoutWithGroup {
  exercises: WorkoutExerciseWithDetails[];
  total_exercises: number;
  completed_exercises: number;
}