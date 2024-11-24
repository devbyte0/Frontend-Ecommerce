import React from 'react'
import ReactDOM from 'react-dom/client'
import {NextUIProvider} from "@nextui-org/react";
import {RouterProvider} from "react-router-dom";
import "./index.css";
import { router } from './routes/router.jsx';



ReactDOM.createRoot(document.getElementById('root')).render(
  <>
  <NextUIProvider>
    <RouterProvider router={router} />  
  </NextUIProvider>
  </>
)