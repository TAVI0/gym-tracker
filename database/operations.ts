import {
    CreateExercise,
    CreateMuscleGroup,
    CreateWorkout,
    CreateWorkoutExercise,
    DatabaseResult,
    Exercise,
    ExerciseWithGroup,
    MuscleGroup,
    WorkoutComplete,
    WorkoutExerciseWithDetails,
    WorkoutWithGroup
} from '../types';
import { db } from './config';

// ===== OPERACIONES PARA GRUPOS MUSCULARES =====

export const getAllMuscleGroups = async (): Promise<DatabaseResult<MuscleGroup[]>> => {
  try {
    const result = await db.getAllAsync('SELECT * FROM muscle_groups ORDER BY name ASC');
    return { success: true, data: result as MuscleGroup[] };
  } catch (error) {
    console.error('Error getting muscle groups:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const createMuscleGroup = async (group: CreateMuscleGroup): Promise<DatabaseResult<number>> => {
  try {
    const result = await db.runAsync(
      'INSERT INTO muscle_groups (name, description) VALUES (?, ?)',
      [group.name, group.description || null]
    );
    return { success: true, data: result.lastInsertRowId };
  } catch (error) {
    console.error('Error creating muscle group:', error);
    return { success: false, error: (error as Error).message };
  }
};

// ===== OPERACIONES PARA EJERCICIOS =====

export const getAllExercises = async (): Promise<DatabaseResult<Exercise[]>> => {
  try {
    const result = await db.getAllAsync('SELECT * FROM exercises ORDER BY name ASC');
    return { success: true, data: result as Exercise[] };
  } catch (error) {
    console.error('Error getting exercises:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getExercisesByMuscleGroup = async (muscleGroupId: number): Promise<DatabaseResult<Exercise[]>> => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM exercises WHERE muscle_group_id = ? ORDER BY name ASC',
      [muscleGroupId]
    );
    return { success: true, data: result as Exercise[] };
  } catch (error) {
    console.error('Error getting exercises by muscle group:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getExercisesWithGroups = async (): Promise<DatabaseResult<ExerciseWithGroup[]>> => {
  try {
    const result = await db.getAllAsync(`
      SELECT 
        e.*,
        mg.name as group_name,
        mg.description as group_description
      FROM exercises e
      INNER JOIN muscle_groups mg ON e.muscle_group_id = mg.id
      ORDER BY mg.name ASC, e.name ASC
    `);
    return { success: true, data: result as ExerciseWithGroup[] };
  } catch (error) {
    console.error('Error getting exercises with groups:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const createExercise = async (exercise: CreateExercise): Promise<DatabaseResult<number>> => {
  try {
    const result = await db.runAsync(
      'INSERT INTO exercises (name, muscle_group_id, description, instructions) VALUES (?, ?, ?, ?)',
      [
        exercise.name, 
        exercise.muscle_group_id, 
        exercise.description || null,
        exercise.instructions || null
      ]
    );
    return { success: true, data: result.lastInsertRowId };
  } catch (error) {
    console.error('Error creating exercise:', error);
    return { success: false, error: (error as Error).message };
  }
};

// ===== OPERACIONES PARA WORKOUTS =====

export const getAllWorkouts = async (): Promise<DatabaseResult<WorkoutWithGroup[]>> => {
  try {
    const result = await db.getAllAsync(`
      SELECT 
        w.*,
        mg.name as group_name,
        mg.description as group_description
      FROM workouts w
      INNER JOIN muscle_groups mg ON w.muscle_group_id = mg.id
      ORDER BY w.date DESC, w.created_at DESC
    `);
    return { success: true, data: result as WorkoutWithGroup[] };
  } catch (error) {
    console.error('Error getting workouts:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getWorkoutsByMuscleGroup = async (muscleGroupId: number): Promise<DatabaseResult<WorkoutWithGroup[]>> => {
  try {
    const result = await db.getAllAsync(`
      SELECT 
        w.*,
        mg.name as group_name,
        mg.description as group_description
      FROM workouts w
      INNER JOIN muscle_groups mg ON w.muscle_group_id = mg.id
      WHERE w.muscle_group_id = ?
      ORDER BY w.date DESC, w.created_at DESC
    `, [muscleGroupId]);
    return { success: true, data: result as WorkoutWithGroup[] };
  } catch (error) {
    console.error('Error getting workouts by muscle group:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getWorkoutComplete = async (workoutId: number): Promise<DatabaseResult<WorkoutComplete>> => {
  try {
    // Obtener workout con grupo muscular
    const workoutResult = await db.getFirstAsync(`
      SELECT 
        w.*,
        mg.name as group_name,
        mg.description as group_description
      FROM workouts w
      INNER JOIN muscle_groups mg ON w.muscle_group_id = mg.id
      WHERE w.id = ?
    `, [workoutId]);

    if (!workoutResult) {
      return { success: false, error: 'Workout not found' };
    }

    // Obtener ejercicios del workout
    const exercisesResult = await db.getAllAsync(`
      SELECT 
        we.*,
        e.name as exercise_name,
        e.description as exercise_description,
        e.instructions as exercise_instructions
      FROM workout_exercises we
      INNER JOIN exercises e ON we.exercise_id = e.id
      WHERE we.workout_id = ?
      ORDER BY we.created_at ASC
    `, [workoutId]);

    const workout = workoutResult as WorkoutWithGroup;
    const exercises = exercisesResult as WorkoutExerciseWithDetails[];
    
    const workoutComplete: WorkoutComplete = {
      ...workout,
      exercises,
      total_exercises: exercises.length,
      completed_exercises: exercises.filter(ex => ex.is_completed).length
    };

    return { success: true, data: workoutComplete };
  } catch (error) {
    console.error('Error getting complete workout:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const createWorkout = async (workout: CreateWorkout): Promise<DatabaseResult<number>> => {
  try {
    const result = await db.runAsync(
      'INSERT INTO workouts (name, muscle_group_id, date, notes) VALUES (?, ?, ?, ?)',
      [workout.name, workout.muscle_group_id, workout.date, workout.notes || null]
    );
    return { success: true, data: result.lastInsertRowId };
  } catch (error) {
    console.error('Error creating workout:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const createWorkoutExercise = async (workoutExercise: CreateWorkoutExercise): Promise<DatabaseResult<number>> => {
  try {
    const result = await db.runAsync(
      'INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [
        workoutExercise.workout_id,
        workoutExercise.exercise_id,
        workoutExercise.sets || null,
        workoutExercise.reps || null,
        workoutExercise.weight || null,
        workoutExercise.notes || null
      ]
    );
    return { success: true, data: result.lastInsertRowId };
  } catch (error) {
    console.error('Error creating workout exercise:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const updateWorkoutExerciseCompletion = async (workoutExerciseId: number, isCompleted: boolean): Promise<DatabaseResult<void>> => {
  try {
    await db.runAsync(
      'UPDATE workout_exercises SET is_completed = ? WHERE id = ?',
      [isCompleted, workoutExerciseId]
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating workout exercise completion:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const updateWorkoutCompletion = async (workoutId: number, isCompleted: boolean): Promise<DatabaseResult<void>> => {
  try {
    await db.runAsync(
      'UPDATE workouts SET is_completed = ? WHERE id = ?',
      [isCompleted, workoutId]
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating workout completion:', error);
    return { success: false, error: (error as Error).message };
  }
};