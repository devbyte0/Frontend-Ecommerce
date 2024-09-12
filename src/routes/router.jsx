import {
    createBrowserRouter
  } from "react-router-dom";
  import Home from "../pages/Home";
  import ContactUs from "../pages/ContactUs";
  import Login from "../pages/Login";
  import SignIn from "../pages/SignIn";
  import Layout from "../layout/Layout";
import Products from "../pages/products";



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
  }])