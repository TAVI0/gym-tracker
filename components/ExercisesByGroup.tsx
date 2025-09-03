import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { MuscleGroup, WorkoutExerciseWithDetails } from '../types';
import ExerciseItem from './ExerciseItem';

interface ExercisesByGroupProps {
  group: MuscleGroup;
  exercises: WorkoutExerciseWithDetails[];
  onExerciseToggle: (exerciseId: number, currentStatus: boolean) => void;
}

const ExercisesByGroup: React.FC<ExercisesByGroupProps> = ({ 
  group, 
  exercises, 
  onExerciseToggle 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = exercises.filter(ex => ex.is_completed).length;
  const totalCount = exercises.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Group Header */}
      <TouchableOpacity 
        style={styles.groupHeader} 
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.exerciseCount}>
            {completedCount}/{totalCount} ejercicios ({completionPercentage}%)
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          {/* Progress indicator */}
          <View style={styles.progressIndicator}>
            <View style={[
              styles.progressCircle,
              completedCount === totalCount && styles.completedCircle
            ]}>
              <Text style={[
                styles.progressText,
                completedCount === totalCount && styles.completedProgressText
              ]}>
                {completedCount}
              </Text>
            </View>
          </View>
          
          {/* Expand/Collapse arrow */}
          <Text style={[
            styles.expandArrow,
            !isExpanded && styles.collapsedArrow
          ]}>
            ▼
          </Text>
        </View>
      </TouchableOpacity>

      {/* Exercises List */}
      {isExpanded && (
        <View style={styles.exercisesList}>
          {exercises.map((exercise) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              onToggle={onExerciseToggle}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressIndicator: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    borderWidth: 2,
    borderColor: '#dee2e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCircle: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  completedProgressText: {
    color: '#fff',
  },
  expandArrow: {
    fontSize: 16,
    color: '#6c757d',
    transform: [{ rotate: '0deg' }],
  },
  collapsedArrow: {
    transform: [{ rotate: '-90deg' }],
  },
  exercisesList: {
    padding: 8,
  },
});

export default ExercisesByGroup;