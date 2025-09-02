// ===== ENTIDADES DE BASE DE DATOS =====

export interface MuscleGroup {
  id: number;
  name: string;// Ejemplo: "Pecho", "Espalda"
  description?: string;
  created_at: string;
}

export interface Exercise {
  id: number;
  name: string;              // Ej: "Curl martillo"
  muscle_group_id: number;   // FK -> MuscleGroup
  description?: string;
  instructions?: string;     // Ej: "Mantener codo fijo"
  created_at: string;
}

export interface Workout { // Representa la sesión de entrenamiento en una fecha.
  id: number;
  date: string;         // YYYY-MM-DD
  notes?: string;       // Ej: "Entrené de noche"
  is_completed: boolean;
  created_at: string;
}

export interface WorkoutExercise { // ejercicio realizado en un workout
   id: number;
  workout_id: number;    // FK -> Workout
  exercise_id: number;   // FK -> Exercise
  is_completed: boolean;
  sets?: number;         // Ej: 4
  reps?: number;         // Ej: 12
  weight?: number;       // Ej: 20 (kg)
  notes?: string;        // Ej: "Última serie fallo"
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
  date: string;         // YYYY-MM-DD
  notes?: string;
  is_completed?: boolean; // opcional, default = false
}

export interface CreateWorkoutExercise {
  workout_id: number;
  exercise_id: number;
  is_completed?: boolean; // opcional, default = false
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

// WorkoutExercise con información del ejercicio
export interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercise_name: string;
  exercise_description?: string;
  exercise_instructions?: string;
}

// Workout completo con ejercicios
export interface WorkoutComplete extends Workout {
  exercises: WorkoutExerciseWithDetails[];
  total_exercises: number;
  completed_exercises: number;
}