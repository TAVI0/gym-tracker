import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Workout } from '../types';

interface WorkoutItemProps {
  workout: Workout;
  onToggle: (id: number, currentStatus: boolean) => void;
  onPress?: (workout: Workout) => void;
}

const WorkoutItem: React.FC<WorkoutItemProps> = ({ 
  workout, 
  onToggle, 
  onPress 
}) => {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Reset time for comparison
      const workoutDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      
      if (workoutDate.getTime() === todayDate.getTime()) {
        return 'Hoy';
      } else if (workoutDate.getTime() === yesterdayDate.getTime()) {
        return 'Ayer';
      } else {
        return date.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });
      }
    } catch (error) {
      return dateString; // fallback
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(workout);
    }
  };

  const handleToggle = () => {
    onToggle(workout.id, workout.is_completed);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.workoutCard,
          workout.is_completed && styles.completedCard
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.leftContent}>
          <View style={styles.dateContainer}>
            <Text style={[
              styles.dateText,
              workout.is_completed && styles.completedText
            ]}>
              {formatDate(workout.date || '')}
            </Text>
          </View>
          
          {workout.notes && workout.notes.trim() && (
            <Text style={[
              styles.notesText,
              workout.is_completed && styles.completedText
            ]} numberOfLines={2}>
              {workout.notes.trim()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.statusButton,
            workout.is_completed && styles.completedButton
          ]}
          onPress={handleToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[
            styles.statusIndicator,
            workout.is_completed && styles.completedIndicator
          ]}>
            {Boolean(workout.is_completed) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  completedCard: {
    backgroundColor: '#f8f9fa',
    opacity: 0.8,
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  dateContainer: {
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  notesText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 18,
  },
  completedText: {
    color: '#adb5bd',
    textDecorationLine: 'line-through',
  },
  statusButton: {
    padding: 4,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dee2e6',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    // No additional styles needed
  },
  completedIndicator: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default WorkoutItem;