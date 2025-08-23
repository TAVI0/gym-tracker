import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MuscleGroup, WorkoutWithGroup } from '../types';
import WorkoutCard from './WorkoutCard';

interface WorkoutsByGroupProps {
  group: MuscleGroup;
  workouts: WorkoutWithGroup[];
  onWorkoutPress: (workout: WorkoutWithGroup) => void;
}

const WorkoutsByGroup: React.FC<WorkoutsByGroupProps> = ({
  group,
  workouts,
  onWorkoutPress,
}) => {
  const completedCount = workouts.filter(w => w.is_completed).length;
  const totalCount = workouts.length;

  return (
    <View style={styles.container}>
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.description && (
            <Text style={styles.groupDescription}>{group.description}</Text>
          )}
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {completedCount}/{totalCount}
          </Text>
          <Text style={styles.statsLabel}>completados</Text>
        </View>
      </View>

      <View style={styles.workoutsContainer}>
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onPress={() => onWorkoutPress(workout)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  statsLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  workoutsContainer: {
    padding: 16,
  },
});

export default WorkoutsByGroup;