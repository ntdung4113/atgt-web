import PracticePage from '../pages/PracticePage';
import MockTestPage from '../pages/MockTestPage';
const privateRoutes = [
    { path: '/practice', element: <PracticePage /> },
    { path: '/test', element: <MockTestPage />}
];

export default privateRoutes; 