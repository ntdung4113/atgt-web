import PracticePage from '../pages/Practice/Practice';
import MockTestPage from '../pages/MockTest/MockTestPage';
import SituationManagement from '../pages/Situation/SituationManagement';
const privateRoutes = [
    { path: '/practice', element: <PracticePage /> }, 
    { path: '/test', element: <MockTestPage />},
    { path: '/manage-situation', element: <SituationManagement />}
];

export default privateRoutes; 