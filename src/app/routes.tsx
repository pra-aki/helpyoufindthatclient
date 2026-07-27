import { createBrowserRouter } from "react-router";
import { Home, Login, SignUp, Dashboard, LeadDetails, Subscription, Payment, Profile, NotFound } from "./pages";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
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
      { path: "leads/:requestId", Component: LeadDetails },
      { path: "subscription", Component: Subscription },
      { path: "payment", Component: Payment },
      { path: "profile", Component: Profile },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);