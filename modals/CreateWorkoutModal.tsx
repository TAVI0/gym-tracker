import React, { useState } from 'react';
import {
    Button,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { createWorkout } from '../database/operations';
import { CreateWorkout } from '../types';

interface CreateWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void; // callback para refrescar lista en el Screen
}

const CreateWorkoutModal: React.FC<CreateWorkoutModalProps> = ({ visible, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [muscleGroupId, setMuscleGroupId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name || !muscleGroupId) {
      alert('Completa al menos nombre y grupo muscular');
      return;
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const newWorkout: CreateWorkout = {
      name,
      muscle_group_id: muscleGroupId,
      date: today,
      notes: notes || undefined,
    };

    const result = await createWorkout(newWorkout);

    if (result.success) {
      onCreated(); // refresca lista en el Screen
      onClose();
      setName('');
      setMuscleGroupId(null);
      setNotes('');
    } else {
      alert(result.error || 'Error al crear workout');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Nuevo Workout</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Muscle Group ID (temporal)"
            value={muscleGroupId ? muscleGroupId.toString() : ''}
            onChangeText={t => setMuscleGroupId(Number(t))}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Notas"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <View style={styles.buttons}>
            <Button title="Cancelar" onPress={onClose} />
            <Button title="Guardar" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default CreateWorkoutModal;
