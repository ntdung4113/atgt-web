import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import SignList from '../pages/Sign/SignList';
import LawList from '../pages/Law/LawList';
import LawDetail from '../pages/Law/LawDetail';
import ViolationList from '../pages/Violation/ViolationList';
import SituationList from '../pages/Situation/SituationList';

const publicRoutes = [
    { path: '/login', element: <Login /> },
    { path: '/', element: <Home /> },
    { path: '/laws', element: <LawList /> },
    { path: '/laws/:lawNumber', element: <LawDetail /> },
    { path: '/signs', element: <SignList /> },
    { path: '/violations', element: <ViolationList /> },
    { path: '/situations', element: <SituationList /> },
];

export default publicRoutes; 