import { createRoot } from 'react-dom/client';
import './global.css';
import App from './app';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
