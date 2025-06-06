import Home from '../components/Home';
// import Practice from '../pages/Practice';
import Login from '../components/auth/Login';
import LawListPage from '../pages/LawListPage';
import LawDetailPage from '../pages/LawDetailPage';
import PostViewPage from '../pages/PostViewPage';
import PostApprovalPage from '../pages/PostApprovalPage';
import SignList from '../components/Sign/SignList';
import AdminImportLawPage from '../pages/AdminImportLawPage';
import ViolationListPage from '../pages/ViolationListPage';

const publicRoutes = [
    { path: '/login', element: <Login /> },
    { path: '/', element: <Home /> },
    { path: '/posts', element: <PostViewPage /> },
    { path: '/posts/approval', element: <PostApprovalPage /> },
    { path: '/laws', element: <LawListPage /> },
    { path: '/laws/:lawNumber', element: <LawDetailPage /> },
    { path: '/signs', element: <SignList /> },
    { path: '/admin/import-law', element: <AdminImportLawPage /> },
    { path: '/violations', element: <ViolationListPage /> },
];

export default publicRoutes; 