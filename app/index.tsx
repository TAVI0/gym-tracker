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
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    
    initDB();
  }, []);

  if (!dbReady) {
   // return <LoadingScreen />; // O algún loading
  }
  return <WorkoutsScreen />;
}