import * as SQLite from 'expo-sqlite';

// Nombre de la base de datos
const DATABASE_NAME = 'gym_trackerV1.db';

// Instancia de la base de datos
export const db = SQLite.openDatabaseSync(DATABASE_NAME);

// Función para resetear completamente la base de datos (DESARROLLO SOLAMENTE)
export const resetDatabase = async (): Promise<void> => {
  try {
    console.log('🗑️ Reseteando base de datos...');
    
    // Borrar todas las tablas
    await db.execAsync('DROP TABLE IF EXISTS workout_exercises;');
    await db.execAsync('DROP TABLE IF EXISTS workouts;');
    await db.execAsync('DROP TABLE IF EXISTS exercises;');
    await db.execAsync('DROP TABLE IF EXISTS muscle_groups;');
    
    console.log('✅ Tablas eliminadas correctamente');
  } catch (error) {
    console.error('❌ Error reseteando base de datos:', error);
    throw error;
  }
};

// Función para inicializar la base de datos
export const initializeDatabase = async (): Promise<void> => {
  try {
    // SOLO EN DESARROLLO: Descomentar la siguiente línea para resetear la DB
    await resetDatabase();
    
    // Verificar y crear las tablas base
    await createBaseTables();
    
    // Ejecutar migraciones para actualizar estructura existente
    await runMigrations();
    
    // Insertar datos iniciales
    await insertInitialData();
    
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
};

// Función para crear las tablas base
const createBaseTables = async (): Promise<void> => {
  // Crear tabla de grupos musculares
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS muscle_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Crear tabla de ejercicios
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      muscle_group_id INTEGER NOT NULL,
      description TEXT,
      instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups (id)
    );
  `);
};

// Función para ejecutar migraciones
const runMigrations = async (): Promise<void> => {
  // Verificar si la tabla workouts existe
  const workoutsExists = await db.getFirstAsync(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='workouts';
  `);

  if (!workoutsExists) {
    // Crear tabla workouts desde cero con estructura correcta
    await db.execAsync(`
      CREATE TABLE workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        notes TEXT,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } else {
    // Verificar estructura actual y migrar si es necesario
    const columns = await db.getAllAsync(`PRAGMA table_info(workouts);`);
    const columnNames = columns.map((col: any) => col.name);
    
    // Si tiene campos incorrectos (name, muscle_group_id), migrar
    if (columnNames.includes('name') || columnNames.includes('muscle_group_id')) {
      console.log('Migrando tabla workouts a estructura correcta...');
      
      // Crear tabla temporal con estructura correcta
      await db.execAsync(`
        CREATE TABLE workouts_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          notes TEXT,
          is_completed BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Copiar solo los datos válidos
      await db.execAsync(`
        INSERT INTO workouts_new (id, date, notes, is_completed, created_at)
        SELECT id, date, notes, is_completed, created_at FROM workouts;
      `);
      
      // Eliminar tabla antigua y renombrar
      await db.execAsync(`DROP TABLE workouts;`);
      await db.execAsync(`ALTER TABLE workouts_new RENAME TO workouts;`);
    }
  }

  // Crear tabla workout_exercises
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      sets INTEGER,
      reps INTEGER,
      weight REAL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises (id)
    );
  `);
};

// Función para insertar datos iniciales
const insertInitialData = async (): Promise<void> => {
  // Insertar datos iniciales de grupos musculares
  await db.execAsync(`
    INSERT OR IGNORE INTO muscle_groups (name, description) VALUES 
    ('Pecho', 'Músculos pectorales'),
    ('Espalda', 'Músculos dorsales, romboides, trapecio'),
    ('Bíceps', 'Músculos bíceps braquial'),
    ('Tríceps', 'Músculos tríceps braquial'),
    ('Hombros', 'Músculos deltoides'),
    ('Piernas', 'Cuádriceps, isquiotibiales, glúteos'),
    ('Pantorrillas', 'Músculos gastrocnemios y sóleo'),
    ('Abdominales', 'Músculos abdominales')
  `);

  // Insertar algunos ejercicios de ejemplo
  await db.execAsync(`
    INSERT OR IGNORE INTO exercises (name, muscle_group_id, description) VALUES 
    ('Banco plano con barra', 1, 'Press de banca horizontal'),
    ('Banco inclinado con mancuernas', 1, 'Press inclinado para pecho superior'),
    ('Dominadas', 2, 'Pull-ups para desarrollo de espalda'),
    ('Remo con barra', 2, 'Ejercicio de tracción horizontal'),
    ('Curl de bíceps con barra', 3, 'Flexión de codo con barra recta'),
    ('Curl martillo', 3, 'Curl con agarre neutro'),
    ('Press francés', 4, 'Extensión de tríceps acostado'),
    ('Fondos en paralelas', 4, 'Dips para tríceps y pecho inferior')
  `);

  // Insertar workouts de ejemplo (solo fecha y notas)
  await db.execAsync(`
    INSERT OR IGNORE INTO workouts (date, notes) VALUES 
    ('2025-08-23', 'Entrenamiento de fuerza'),
    ('2025-08-22', 'Volumen alto'),
    ('2025-08-21', 'Definición muscular')
  `);

  // Insertar ejercicios de workout de ejemplo
  await db.execAsync(`
    INSERT OR IGNORE INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, is_completed) VALUES 
    (1, 1, 4, 8, 80.0, true),
    (1, 2, 3, 10, 25.0, true),
    (2, 3, 4, 6, 0, false),
    (2, 4, 3, 8, 60.0, true),
    (2, 5, 3, 12, 20.0, false),
    (3, 7, 4, 10, 40.0, true),
    (3, 8, 3, 12, 0, false)
  `);
};