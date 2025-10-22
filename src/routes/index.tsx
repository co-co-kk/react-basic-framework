import { lazy } from 'react';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route } from 'react-router-dom';

import ErrorBoundary from '@/components/ErrorBoundary';
import ContextWrapper from './contexts';
import { CustomNavigate } from './customization/custom-navigate';
import { ProtectedRoute } from './authorization/authGuard';
import Home from '@/pages/Home';
// import { DashboardHomePage } from "@/pages/DashboardHomePage/index";
const LoginPage = lazy(() => import('@/pages/LoginPage/index.tsx'));
const Layout = lazy(() => import('@/layouts/MainLayout.tsx'));
const AiXiaoxing = lazy(
  // () => import("@/pages/ShuzhiXiaoxing/index")
  () => import('@/pages/Xiaoxing/index.tsx'),
);

const WJRag = lazy(() => import('@/pages/wujiePage/rag'));
const WJTemplate = lazy(() => import('@/pages/wujiePage/template'));
const WJDemoCenter = lazy(() => import('@/pages/wujiePage/demoCenter'));
const WJInsight = lazy(() => import('@/pages/wujiePage/insight'));
const WJXingFlow = lazy(() => import('@/pages/wujiePage/xingflow'));
const WJDoc = lazy(() => import('@/pages/wujiePage/doc'));
const WJAuthorize = lazy(() => import('@/pages/wujiePage/authorize'));
const WJSquare = lazy(() => import('@/pages/wujiePage/square'));
const WJAssistant = lazy(() => import('@/pages/wujiePage/assistant'));
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
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      {/* <Route path="/about" element={<About />} /> */}
    </Route>,
    <Route path="/login" element={<LoginPage />} errorElement={<ErrorBoundary />} />,

    <Route
      path="/"
      element={
        <ContextWrapper>
          <Outlet />
        </ContextWrapper>
      }
    >
      <Route path="navigation/xiaoxing" element={<Layout />}>
        <Route index element={<AiXiaoxing />} />
      </Route>
      <Route path="rag/*" element={<Layout />}>
        <Route path="*" element={<WJRag />} />
      </Route>
      <Route path="format/*" element={<Layout />}>
        <Route path="*" element={<WJTemplate />} />
      </Route>
      <Route path="doc/*" element={<Layout />}>
        <Route path="*" element={<WJDoc />} />
      </Route>
      <Route path="demoCenter/*" element={<Layout />}>
        <Route path="*" element={<WJDemoCenter />} />
      </Route>
      <Route path="insight/*" element={<Layout />}>
        <Route path="*" element={<WJInsight />} />
      </Route>
      <Route path="xingflow/*" element={<Layout />}>
        <Route path="*" element={<WJXingFlow />} />
      </Route>
      <Route path="internal/*" element={<Layout />}>
        <Route path="*" element={<WJAuthorize />} />
      </Route>
      <Route path="square/*" element={<Layout />}>
        <Route path="*" element={<WJSquare />} />
      </Route>
      <Route path="assistant/*" element={<Layout />}>
        <Route path="*" element={<WJAssistant />} />
      </Route>
    </Route>,

    <Route path="*" element={<CustomNavigate replace to="/" />} />,
  ]),
  { basename: '/digitalSprite' },
);

export default router;
