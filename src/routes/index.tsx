import { lazy } from 'react';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route } from 'react-router-dom';

import ErrorBoundary from '@/components/ErrorBoundary';

import { CustomNavigate } from './customization/custom-navigate';
import { ProtectedRoute } from "./authorization/authGuard";
import Home from "@/pages/Home";
// import { DashboardHomePage } from "@/pages/DashboardHomePage/index";
const LoginPage = lazy(() => import('@/pages/LoginPage/index.tsx'));
const Layout = lazy(() => import('@/layouts/MainLayout.tsx'));
const AiXiaoxing = lazy(
  // () => import("@/pages/ShuzhiXiaoxing/index")
  () => import("@/pages/Xiaoxing/index.tsx")
);
  // <Routes>
    //   <Route element={<MainLayout />}>
    //     <Route path="/" element={<Home />} />
    //     <Route path="/about" element={<About />} />
    //   </Route>
    //   <Route element={<AuthLayout />}>
    //     <Route path="/login" element={<Login />} />
    //   </Route>
    //   <Route path="*" element={<Navigate to="/" />} />
    // </Routes>
const router = createBrowserRouter(
  createRoutesFromElements([
    // <Route path="/"  element={}  />,
    <Route path="/"  element={<Layout />}>
        <Route index element={<Home />} />
        {/* <Route path="/about" element={<About />} /> */}
    </Route>,
    <Route path="/login" element={<LoginPage />} errorElement={<ErrorBoundary />} />,
    <Route
      path="navigation/xiaoxing"
      element={
        <Layout/>
      }
    >
      <Route index element={<AiXiaoxing />} />
    </Route>,
    <Route path="*" element={<CustomNavigate replace to="/" />} />,
  ]),
  { basename: '/digitalSprite' },
);

export default router;
