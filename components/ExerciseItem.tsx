import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WorkoutExerciseWithDetails } from '../types';

interface ExerciseItemProps {
  exercise: WorkoutExerciseWithDetails;
  onToggle: (exerciseId: number, currentStatus: boolean) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ 
  exercise, 
  onToggle 
}) => {
  const handleToggle = () => {
    onToggle(exercise.id, exercise.is_completed);
  };

  const formatExerciseDetails = (): string => {
    const details: string[] = [];
    
    if (exercise.sets) details.push(`${exercise.sets} series`);
    if (exercise.reps) details.push(`${exercise.reps} reps`);
    if (exercise.weight) details.push(`${exercise.weight}kg`);
    
    return details.length > 0 ? details.join(' • ') : '';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        exercise.is_completed && styles.completedContainer
      ]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        {/* Checkbox */}
        <View style={[
          styles.checkbox,
          exercise.is_completed && styles.checkedBox
        ]}>
          {Boolean(exercise.is_completed) && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>

        {/* Exercise Info */}
        <View style={styles.exerciseInfo}>
          <Text style={[
            styles.exerciseName,
            exercise.is_completed && styles.completedText
          ]}>
            {exercise.exercise_name}
          </Text>
          
          {formatExerciseDetails() && (
            <Text style={[
              styles.exerciseDetails,
              exercise.is_completed && styles.completedText
            ]}>
              {formatExerciseDetails()}
            </Text>
          )}
          
          {exercise.notes && (
            <Text style={[
              styles.exerciseNotes,
              exercise.is_completed && styles.completedText
            ]}>
              📝 {exercise.notes}
            </Text>
          )}
          
          {exercise.exercise_instructions && (
            <Text style={[
              styles.exerciseInstructions,
              exercise.is_completed && styles.completedText
            ]} numberOfLines={2}>
              💡 {exercise.exercise_instructions}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  completedContainer: {
    backgroundColor: '#f1f3f4',
    opacity: 0.8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dee2e6',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    marginBottom: 4,
  },
  exerciseNotes: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  exerciseInstructions: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 16,
  },
  completedText: {
    color: '#adb5bd',
    textDecorationLine: 'line-through',
  },
});

export default ExerciseItem;