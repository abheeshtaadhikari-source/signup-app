import { useState } from 'react';
import AuthForm from './components/AuthForm.jsx';

export default function App() {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  return <AuthForm mode={mode} onSwitch={setMode} />;
}
