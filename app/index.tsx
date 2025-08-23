import { useEffect } from 'react';
import { initializeDatabase } from '../database/config';
import WorkoutsScreen from '../screens/WorkoutsScreen';

export default function App() {
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        console.log('DB initialized successfully');
      } catch (error) {
        console.error('Failed to initialize DB:', error);
      }
    };
    
    init();
  }, []);

  return <WorkoutsScreen />;
}