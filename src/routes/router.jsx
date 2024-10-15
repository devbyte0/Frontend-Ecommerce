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

import AdminProfile from "../pages/AdminProfile";
import UserCrudPage from "../pages/UserCrudPage";
import ProductAdminPage from "../pages/ProductAdminPage";
import ChatList from "../pages/ChatList";
import MessagePage from "../pages/MessagePage";
import ProductCRUDPage from "../pages/ProductCrudPage";





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
        path:"/admin",
        element:<AdminLogin/>
    },
    {
      path:"/admin",
      element:<AdminDashBoard/>,
      children:[
        {
         path:"/admin/dashboard",
         element:<Dashboard/>
        },
        {
          path:"/admin/admins",
          element:<AdminCrudPage/>
        },
        {
          path:"/admin/profile",
          element:<AdminProfile/>

        },
        {
          path:"/admin/users",
          element:<UserCrudPage/>

        },
        {
          path:"/admin/products",
          element:<ProductAdminPage/>

        },
        {
          path:"/admin/inbox",
          element:<ChatList/>

        },
        {
          path:"/admin/inbox/:id",
          element:<MessagePage/>

        },
        {
          path:"/admin/products/products",
          element:<ProductCRUDPage/>

        }
        
      ]
    }
  ]
  }])