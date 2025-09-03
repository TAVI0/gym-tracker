import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ExercisesByGroup from '../components/ExercisesByGroup';
import { getWorkoutComplete, updateWorkoutExerciseCompletion } from '../database/operations';
import { MuscleGroup, WorkoutComplete, WorkoutExerciseWithDetails } from '../types';

interface GroupedExercises {
  [groupName: string]: {
    group: MuscleGroup;
    exercises: WorkoutExerciseWithDetails[];
  };
}

interface WorkoutDetailScreenProps {
  workoutId: number;
  onBack: () => void;
}

const WorkoutDetailScreen: React.FC<WorkoutDetailScreenProps> = ({ 
  workoutId, 
  onBack 
}) => {
  const [workoutComplete, setWorkoutComplete] = useState<WorkoutComplete | null>(null);
  const [groupedExercises, setGroupedExercises] = useState<GroupedExercises>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkoutDetail = async () => {
    try {
      const result = await getWorkoutComplete(workoutId);
      if (result.success && result.data) {
        setWorkoutComplete(result.data);
        groupExercisesByMuscleGroup(result.data.exercises);
      } else {
        Alert.alert('Error', result.error || 'No se pudo cargar el workout');
      }
    } catch (error) {
      console.error('Error loading workout detail:', error);
      Alert.alert('Error', 'Error inesperado al cargar el workout');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const groupExercisesByMuscleGroup = async (exercises: WorkoutExerciseWithDetails[]) => {
    // Necesitamos obtener la información del grupo muscular para cada ejercicio
    // Como WorkoutExerciseWithDetails no incluye group info, necesitamos hacer otra consulta
    const grouped: GroupedExercises = {};
    
    // Por ahora agrupamos por exercise_id y luego necesitaremos mejorar esto
    // con una query que traiga también la info del grupo muscular
    exercises.forEach(exercise => {
      // Temporal: usar exercise_name como grupo hasta que mejoremos la query
      const groupKey = `Grupo ${exercise.exercise_id}`;
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          group: {
            id: exercise.exercise_id,
            name: groupKey,
            description: '',
            created_at: ''
          },
          exercises: []
        };
      }
      
      grouped[groupKey].exercises.push(exercise);
    });

    setGroupedExercises(grouped);
  };

  const handleExerciseToggle = async (exerciseId: number, currentStatus: boolean) => {
    try {
      // Optimistic update
      if (workoutComplete) {
        const updatedExercises = workoutComplete.exercises.map(ex =>
          ex.id === exerciseId
            ? { ...ex, is_completed: !currentStatus }
            : ex
        );
        
        setWorkoutComplete({
          ...workoutComplete,
          exercises: updatedExercises,
          completed_exercises: updatedExercises.filter(ex => ex.is_completed).length
        });
        
        groupExercisesByMuscleGroup(updatedExercises);
      }

      // Update in database
      const result = await updateWorkoutExerciseCompletion(exerciseId, !currentStatus);
      
      if (!result.success) {
        // Revert on error
        loadWorkoutDetail();
        Alert.alert('Error', result.error || 'No se pudo actualizar el ejercicio');
      }
    } catch (error) {
      console.error('Error toggling exercise:', error);
      loadWorkoutDetail(); // Revert
      Alert.alert('Error', 'Error inesperado al actualizar el ejercicio');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkoutDetail();
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getCompletionPercentage = (): number => {
    if (!workoutComplete || workoutComplete.total_exercises === 0) return 0;
    return Math.round((workoutComplete.completed_exercises / workoutComplete.total_exercises) * 100);
  };

  useEffect(() => {
    loadWorkoutDetail();
  }, [workoutId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Cargando workout...</Text>
      </View>
    );
  }

  if (!workoutComplete) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No se pudo cargar el workout</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadWorkoutDetail}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.dateTitle}>{formatDate(workoutComplete.date)}</Text>
          {workoutComplete.notes && (
            <Text style={styles.notesText}>{workoutComplete.notes}</Text>
          )}
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {workoutComplete.completed_exercises}/{workoutComplete.total_exercises} ejercicios
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${getCompletionPercentage()}%` }]} 
            />
          </View>
          <Text style={styles.percentageText}>{getCompletionPercentage()}%</Text>
        </View>
      </View>

      {/* Exercises */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(groupedExercises).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay ejercicios en este workout</Text>
          </View>
        ) : (
          Object.entries(groupedExercises).map(([groupName, { group, exercises }]) => (
            <ExercisesByGroup
              key={groupName}
              group={group}
              exercises={exercises}
              onExerciseToggle={handleExerciseToggle}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  headerInfo: {
    marginBottom: 20,
  },
  dateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default WorkoutDetailScreen;