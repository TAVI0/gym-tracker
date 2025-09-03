//import CreateWorkoutModal from '@/modals/CreateWorkoutModal';
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
import WorkoutItem from '../components/WorkoutItem';
import { getAllWorkouts, updateWorkoutCompletion } from '../database/operations';
import { Workout } from '../types';
import WorkoutDetailScreen from './WorkoutDetailScreen';

const WorkoutsScreen: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);

  const loadWorkouts = async () => {
    try {
      const result = await getAllWorkouts();
      if (result.success && result.data) {
        setWorkouts(result.data);
      } else {
        Alert.alert('Error', result.error || 'No se pudieron cargar los workouts');
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
      Alert.alert('Error', 'Error inesperado al cargar los workouts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleWorkoutPress = (workout: Workout) => {
    setSelectedWorkoutId(workout.id);
  };

  const handleBackToList = () => {
    setSelectedWorkoutId(null);
    // Refresh workouts when coming back from detail
    loadWorkouts();
  };

  const handleWorkoutToggle = async (workoutId: number, currentStatus: boolean) => {
    try {
      // Optimistic update
      setWorkouts(prev =>
        prev.map(w =>
          w.id === workoutId
            ? { ...w, is_completed: !currentStatus }
            : w
        )
      );

      // Update in database
      const result = await updateWorkoutCompletion(workoutId, !currentStatus);
      
      if (!result.success) {
        // Revert optimistic update on error
        setWorkouts(prev =>
          prev.map(w =>
            w.id === workoutId
              ? { ...w, is_completed: currentStatus }
              : w
          )
        );
        Alert.alert('Error', result.error || 'No se pudo actualizar el workout');
      }
    } catch (error) {
      console.error('Error toggling workout:', error);
      // Revert optimistic update
      setWorkouts(prev =>
        prev.map(w =>
          w.id === workoutId
            ? { ...w, is_completed: currentStatus }
            : w
        )
      );
      Alert.alert('Error', 'Error inesperado al actualizar el workout');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  // Si hay un workout seleccionado, mostrar el detalle
  if (selectedWorkoutId !== null) {
    return (
      <WorkoutDetailScreen
        workoutId={selectedWorkoutId}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Cargando workouts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>
          {workouts.length} workout{workouts.length !== 1 ? 's' : ''} total
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {workouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay workouts creados</Text>
            <Text style={styles.emptySubtext}>
              ¡Crea tu primer workout para comenzar a entrenar!
            </Text>
          </View>
        ) : (
          <View style={styles.workoutsList}>
            {workouts.map((workout) => (
              <WorkoutItem
                key={workout.id}
                workout={workout}
                onToggle={handleWorkoutToggle}
                onPress={handleWorkoutPress}
              />
            ))}
          </View>
        )}
      </ScrollView>
{/*
      <CreateWorkoutModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreated={loadWorkouts}
      />
*/}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007bff',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
  },
  workoutsList: {
    gap: 12,
  },
});

export default WorkoutsScreen;