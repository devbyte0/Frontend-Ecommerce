import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import ContactUs from "../pages/ContactUs";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Layout from "../layout/Layout";
import Products from "../pages/Products";
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
import ProductView from "../pages/ProductView";
import ColorManagement from "../pages/Colors";
import SizeManagement from "../pages/Sizes";
import CategoryManagement from "../pages/Categories";
import GenderManagement from "../pages/Gender";
import ProductCreate from "../pages/ProductCreate";
import BadgeManagement from "../pages/Badges";
import ProductEdit from "../pages/ProductEdit";
import CouponManagement from "../pages/Coupon";
import CartPage from "../pages/Cart";
import SliderManagement from "../pages/AdminSlides";
import RelatedProductManagement from "../pages/RelatedProduct";
import CheckoutPage from "../pages/Checkout";
import UserProfile from "../pages/User";
import UserLayout from "../layout/UserLayout";
import OrdersUser from "../pages/OrdersUser";
import MeasureTypeAdminPage from "../pages/MeasureType";
import AdminOrdersPage from "../pages/OrderAdmin";
import OrderConfirmationPage from "../pages/OrderConfirmation";
import AdminRoutes  from "./AdminRoutes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/home",
        element: <Home />
      },
      {
        path: "/products",
        element: <Products />
      },
      {
        path: "/products/:id",
        element: <ProductView />
      },
      {
        path: "/contactus",
        element: <ContactUs />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/signup",
        element: <SignUp />
      },
      {
        path: "/cart",
        element: <CartPage />
      },
      {
        path: "/checkout",
        element: <CheckoutPage />
      },
      {
        path: "/profile",
        element: <UserLayout />,
        children: [
          {
            path: "/profile",
            element: <UserProfile />
          },
          {
            path: "orders",
            element: <OrdersUser />
          },
          {
            path: "orders/order-confirmation/:orderId",
            element: <OrderConfirmationPage />
          }
        ]
      }
    ]
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "/admin",
        element: <AdminLogin />
      },
      { path: "/admin",
        element: <AdminRoutes/>,
        children: [
          {
            path: "dashboard",
            element: <AdminDashBoard />,
            children: [
              { 
                path: "",
                element: <Dashboard />
              },
              {
                path: "admins",
                element: <AdminCrudPage />
              },
              {
                path: "profile",
                element: <AdminProfile />
              },
              {
                path: "users",
                element: <UserCrudPage />
              },
              {
                path: "products",
                element: <ProductAdminPage />
              },
              {
                path: "inbox",
                element: <ChatList />
              },
              {
                path: "inbox/:id",
                element: <MessagePage />
              },
              {
                path: "products/products",
                element: <ProductCRUDPage />
              },
              {
                path: "products/products/:id",
                element: <ProductEdit />
              },
              {
                path: "products/colors",
                element: <ColorManagement />
              },
              {
                path: "products/sizes",
                element: <SizeManagement />
              },
              {
                path: "products/categories",
                element: <CategoryManagement />
              },
              {
                path: "products/gender",
                element: <GenderManagement />
              },
              {
                path: "products/products/createproducts",
                element: <ProductCreate />
              },
              {
                path: "products/badges",
                element: <BadgeManagement />
              },
              {
                path: "products/coupons",
                element: <CouponManagement />
              },
              {
                path: "products/slides",
                element: <SliderManagement />
              },
              {
                path: "products/related",
                element: <RelatedProductManagement />
              },
              {
                path: "products/measure-type",
                element: <MeasureTypeAdminPage />
              },
              {
                path: "orders",
                element: <AdminOrdersPage />
              }
            ]
          }
        ]
      }
    ]
  }
]);