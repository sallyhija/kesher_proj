import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set global RTL direction for Hebrew
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'he';

createRoot(document.getElementById("root")!).render(<App />);
