import {
    createBrowserRouter
  } from "react-router-dom";
  import Home from "../pages/Home";
  import ContactUs from "../pages/ContactUs";
  import Login from "../pages/Login";
  import SignIn from "../pages/SignIn";
  import Layout from "../layout/Layout";
import Products from "../pages/products";
import AdminLayout from "../layout/AdminLayout";
import AdminLogin from "../pages/AdminLogin";
import AdminDashBoard from "../pages/AdminDashBoard";
import Dashboard from "../pages/Dashboard";
import AdminCrudPage from "../pages/AdminCrudPage";



  export const router = createBrowserRouter([{
    path:"/",
    element:<Layout/>,
    children:[
        {
            path:"/",
            element:<Home/>
        },
        {
          path: "/home",
          element: <Home/>
        },
        {
          path:"/products",
          element:<Products/>
            
        },
        {
            path: "/contactus",
            element: <ContactUs/>
        },
        {
            path: "/login",
            element: <Login/>
        },
        {
            path: "/signin",
            element: <SignIn/>
        },
    ]
  },{
    path:"/admin",
    element:<AdminLayout/>,
    children:[
      {
        path:"/admin/login",
        element:<AdminLogin/>
    },
    {
      path:"/admin/dashboard",
      element:<AdminDashBoard/>,
      children:[
        {
         path:"/admin/dashboard",
         element:<Dashboard/>
        },
        {
          path:"/admin/dashboard/admins",
          element:<AdminCrudPage/>
        }
      ]
    }
  ]
  }])