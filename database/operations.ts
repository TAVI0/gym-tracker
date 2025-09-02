import {
  CreateExercise,
  CreateMuscleGroup,
  CreateWorkout,
  CreateWorkoutExercise,
  DatabaseResult,
  Exercise,
  ExerciseWithGroup,
  MuscleGroup,
  Workout,
  WorkoutComplete,
  WorkoutExercise,
  WorkoutExerciseWithDetails
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

export const updateMuscleGroup = async (id: number, group: Partial<CreateMuscleGroup>): Promise<DatabaseResult<void>> => {
  try {
    await db.runAsync(
      'UPDATE muscle_groups SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?',
      [group.name || null, group.description || null, id]
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating muscle group:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const deleteMuscleGroup = async (id: number): Promise<DatabaseResult<void>> => {
  try {
    await db.runAsync('DELETE FROM muscle_groups WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting muscle group:', error);
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

export const updateExercise = async (id: number, exercise: Partial<CreateExercise>): Promise<DatabaseResult<void>> => {
  try {
    await db.runAsync(`
      UPDATE exercises 
      SET 
        name = COALESCE(?, name), 
        muscle_group_id = COALESCE(?, muscle_group_id),
        description = COALESCE(?, description),
        instructions = COALESCE(?, instructions)
      WHERE id = ?
    `, [
      exercise.name || null, 
      exercise.muscle_group_id || null, 
      exercise.description || null,
      exercise.instructions || null,
      id
    ]);
    return { success: true };
  } catch (error) {
    console.error('Error updating exercise:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const deleteExercise = async (id: number): Promise<DatabaseResult<void>> => {
  try {
    await db.runAsync('DELETE FROM exercises WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return { success: false, error: (error as Error).message };
  }
};

// ===== OPERACIONES PARA WORKOUTS =====

export const getAllWorkouts = async (): Promise<DatabaseResult<Workout[]>> => {
  try {
    const result = await db.getAllAsync('SELECT * FROM workouts ORDER BY date DESC, created_at DESC');
    return { success: true, data: result as Workout[] };
  } catch (error) {
    console.error('Error getting workouts:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getWorkout = async (id: number): Promise<DatabaseResult<Workout>> => {
  try {
    const result = await db.getFirstAsync('SELECT * FROM workouts WHERE id = ?', [id]);
    if (!result) {
      return { success: false, error: 'Workout not found' };
    }
    return { success: true, data: result as Workout };
  } catch (error) {
    console.error('Error getting workout:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getWorkoutsByMuscleGroup = async (muscleGroupId: number): Promise<DatabaseResult<Workout[]>> => {
  try {
    // Obtener workouts que contengan ejercicios de este grupo muscular
    const result = await db.getAllAsync(`
      SELECT DISTINCT w.*
      FROM workouts w
      INNER JOIN workout_exercises we ON w.id = we.workout_id
      INNER JOIN exercises e ON we.exercise_id = e.id
      WHERE e.muscle_group_id = ?
      ORDER BY w.date DESC, w.created_at DESC
    `, [muscleGroupId]);
    return { success: true, data: result as Workout[] };
  } catch (error) {
    console.error('Error getting workouts by muscle group:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getWorkoutComplete = async (workoutId: number): Promise<DatabaseResult<WorkoutComplete>> => {
  try {
    // Obtener workout
    const workoutResult = await db.getFirstAsync('SELECT * FROM workouts WHERE id = ?', [workoutId]);

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

    const workout = workoutResult as Workout;
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
      'INSERT INTO workouts (date, notes, is_completed) VALUES (?, ?, ?)',
      [workout.date, workout.notes || null, workout.is_completed || false]
    );
    return { success: true, data: result.lastInsertRowId };
  } catch (error) {
    console.error('Error creating workout:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const updateWorkout = async (id: number, workout: Partial<CreateWorkout>): Promise<DatabaseResult<void>> => {
  try {
    await db.runAsync(`
      UPDATE workouts 
      SET 
        date = COALESCE(?, date),
        notes = COALESCE(?, notes),
        is_completed = COALESCE(?, is_completed)
      WHERE id = ?
    `, [
      workout.date || null,
      workout.notes || null,
      workout.is_completed !== undefined ? workout.is_completed : null,
      id
    ]);
    return { success: true };
  } catch (error) {
    console.error('Error updating workout:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const deleteWorkout = async (id: number): Promise<DatabaseResult<void>> => {
  try {
    await db.runAsync('DELETE FROM workouts WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting workout:', error);
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

// ===== OPERACIONES PARA WORKOUT_EXERCISES =====

export const getAllWorkoutExercises = async (workoutId: number): Promise<DatabaseResult<WorkoutExercise[]>> => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY created_at ASC', 
      [workoutId]
    );
    return { success: true, data: result as WorkoutExercise[] };
  } catch (error) {
    console.error('Error getting workout exercises:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getWorkoutExercisesWithDetails = async (workoutId: number): Promise<DatabaseResult<WorkoutExerciseWithDetails[]>> => {
  try {
    const result = await db.getAllAsync(`
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
    return { success: true, data: result as WorkoutExerciseWithDetails[] };
  } catch (error) {
    console.error('Error getting workout exercises with details:', error);
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

export const updateWorkoutExercise = async (id: number, workoutExercise: Partial<CreateWorkoutExercise>): Promise<DatabaseResult<void>> => {
  try {
    await db.runAsync(`
      UPDATE workout_exercises 
      SET 
        sets = COALESCE(?, sets),
        reps = COALESCE(?, reps),
        weight = COALESCE(?, weight),
        notes = COALESCE(?, notes),
        is_completed = COALESCE(?, is_completed)
      WHERE id = ?
    `, [
      workoutExercise.sets || null,
      workoutExercise.reps || null,
      workoutExercise.weight || null,
      workoutExercise.notes || null,
      workoutExercise.is_completed !== undefined ? workoutExercise.is_completed : null,
      id
    ]);
    return { success: true };
  } catch (error) {
    console.error('Error updating workout exercise:', error);
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

export const deleteWorkoutExercise = async (id: number): Promise<DatabaseResult<void>> => {
  try {
    await db.runAsync('DELETE FROM workout_exercises WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting workout exercise:', error);
    return { success: false, error: (error as Error).message };
  }
};