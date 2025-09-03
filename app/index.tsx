import { useEffect, useState } from 'react';
import { initializeDatabase } from '../database/config';
import WorkoutsScreen from '../screens/WorkoutsScreen';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        await initializeDatabase();
        setDbReady(true);
        console.log('✅ DB initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize database:', error);
      }
    };
    
    initDB();
  }, []);

  if (!dbReady) {
    return null; // No renderizar nada hasta que la DB esté lista
  }
  
  return <WorkoutsScreen />;
}