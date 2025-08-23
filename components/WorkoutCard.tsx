import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { WorkoutWithGroup } from '../types';

interface WorkoutCardProps {
  workout: WorkoutWithGroup;
  onPress: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getStatusColor = () => {
    return workout.is_completed ? '#28a745' : '#ffc107';
  };

  const getStatusText = () => {
    return workout.is_completed ? 'Completado' : 'Pendiente';
  };

  const getStatusIcon = () => {
    return workout.is_completed ? '✓' : '○';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.workoutName} numberOfLines={1}>
              {workout.name}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
            </View>
          </View>
          
          <View style={styles.metaInfo}>
            <Text style={styles.date}>{formatDate(workout.date)}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>

          {workout.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {workout.notes}
            </Text>
          )}
        </View>

        <View style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  mainInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
  separator: {
    fontSize: 14,
    color: '#6c757d',
    marginHorizontal: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    color: '#495057',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  arrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    color: '#ced4da',
    fontWeight: '300',
  },
});

export default WorkoutCard;