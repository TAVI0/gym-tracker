import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import WorkoutsByGroup from '../components/WorkoutsByGroup';
import { getAllWorkouts } from '../database/operations';
import { MuscleGroup, WorkoutWithGroup } from '../types';

interface GroupedWorkouts {
  [groupName: string]: {
    group: MuscleGroup;
    workouts: WorkoutWithGroup[];
  };
}

const WorkoutsScreen: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutWithGroup[]>([]);
  const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkouts>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = async () => {
    try {
      const result = await getAllWorkouts();
      if (result.success && result.data) {
        setWorkouts(result.data);
        groupWorkoutsByMuscleGroup(result.data);
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

  const groupWorkoutsByMuscleGroup = (workoutsList: WorkoutWithGroup[]) => {
    const grouped: GroupedWorkouts = {};
    
    workoutsList.forEach(workout => {
      const groupName = workout.group_name;
      
      if (!grouped[groupName]) {
        grouped[groupName] = {
          group: {
            id: workout.muscle_group_id,
            name: workout.group_name,
            description: workout.group_description,
            created_at: '' // No necesitamos esta fecha aquí
          },
          workouts: []
        };
      }
      
      grouped[groupName].workouts.push(workout);
    });

    setGroupedWorkouts(grouped);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

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
        <Text style={styles.title}>Mis Workouts</Text>
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
        {Object.keys(groupedWorkouts).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay workouts creados</Text>
            <Text style={styles.emptySubtext}>
              ¡Crea tu primer workout para comenzar a entrenar!
            </Text>
          </View>
        ) : (
          Object.entries(groupedWorkouts).map(([groupName, { group, workouts: groupWorkouts }]) => (
            <WorkoutsByGroup
              key={groupName}
              group={group}
              workouts={groupWorkouts}
              onWorkoutPress={(workout) => {
                // TODO: Navegar a detalle del workout
                console.log('Workout pressed:', workout.name);
              }}
            />
          ))
        )}
      </ScrollView>

      {/* TODO: Agregar botón flotante para crear nuevo workout */}
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
});

export default WorkoutsScreen;