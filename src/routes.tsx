import { createHashRouter } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Algorithms from './pages/Algorithms';
import Visualizer from './pages/Visualizer';
import Challenges from './pages/Challenges';
import Progress from './pages/Progress';
import Login from './pages/Login';
import ResetPassword from './pages/Resetpassword';

export const router = createHashRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'algorithms', Component: Algorithms },
      { path: 'visualizer/:id', Component: Visualizer },
      { path: 'challenges', Component: Challenges },
      { path: 'progress', Component: Progress },
      { path: 'login', Component: Login },
      { path: 'reset-password', Component: ResetPassword },
    ],
  },
]);