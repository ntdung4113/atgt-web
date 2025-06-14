import PracticePage from '../pages/Practice/Practice';
import MockTestPage from '../pages/MockTest/MockTestPage';
const privateRoutes = [
    { path: '/practice', element: <PracticePage /> }, 
    { path: '/test', element: <MockTestPage />}
];

export default privateRoutes; 