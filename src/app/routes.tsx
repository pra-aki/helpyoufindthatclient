import { createBrowserRouter } from "react-router";
import { Home, Privacy, Terms, Login, SignUp, Dashboard, AddProduct, ProductDashboard, ProductSearchResults, ProductJobs, JobLeads, Profile, NotFound } from "./pages";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/privacy",
    Component: Privacy,
  },
  {
    path: "/terms",
    Component: Terms,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/dashboard",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "products/new", Component: AddProduct },
      { path: "products/:productId", Component: ProductDashboard },
      { path: "products/:productId/results", Component: ProductSearchResults },
      { path: "products/:productId/jobs", Component: ProductJobs },
      { path: "products/:productId/jobs/:jobId/leads", Component: JobLeads },
      { path: "profile", Component: Profile },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
