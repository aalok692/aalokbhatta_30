import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import SiteLayout from "./components/SiteLayout.jsx";
import FutureAssistant from "./components/FutureAssistant.jsx";
import FutureMessaging from "./components/FutureMessaging.jsx";
import { trackPageView } from "./lib/analytics.js";

const Home = lazy(() => import("./pages/Home.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Projects = lazy(() => import("./pages/Projects.jsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.jsx"));
const Gallery = lazy(() => import("./pages/Gallery.jsx"));
const Journal = lazy(() => import("./pages/Journal.jsx"));
const JournalDetail = lazy(() => import("./pages/JournalDetail.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function Loading() {
  return <div className="loading-state" role="status"><span className="loading-dot" />Loading page</div>;
}

export default function App() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:slug" element={<ProjectDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="journal" element={<Journal />} />
            <Route path="journal/:slug" element={<JournalDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/blog" element={<Navigate to="/journal" replace />} />
        </Routes>
      </Suspense>
      <FutureAssistant />
      <FutureMessaging />
    </>
  );
}
