import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import ContactUs from "../pages/ContactUs";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Layout from "../layout/Layout";
import Products from "../pages/Products";
import ProductView from "../pages/ProductView";
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
import ProductEdit from "../pages/ProductEdit";
import ColorManagement from "../pages/Colors";
import SizeManagement from "../pages/Sizes";
import CategoryManagement from "../pages/Categories";
import GenderManagement from "../pages/Gender";
import ProductCreate from "../pages/ProductCreate";
import BadgeManagement from "../pages/Badges";
import CouponManagement from "../pages/Coupon";
import SliderManagement from "../pages/AdminSlides";
import RelatedProductManagement from "../pages/RelatedProduct";
import CartPage from "../pages/Cart";
import CheckoutPage from "../pages/Checkout";
import UserProfile from "../pages/User";
import UserLayout from "../pages/UserLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/home", element: <Home /> },
      { path: "/products", element: <Products /> },
      { path: "/products/:id", element: <ProductView /> },
      { path: "/contactus", element: <ContactUs /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      {
        path: "/profile",
        element: <UserLayout />,
        children: [
          { path: "/profile", element: <UserProfile /> },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <AdminLogin /> },
      {
        path: "/admin/dashboard",
        element: <AdminDashBoard />,
        children: [
          { path: "/admin/dashboard", element: <Dashboard /> },
          { path: "/admin/admins", element: <AdminCrudPage /> },
          { path: "/admin/profile", element: <AdminProfile /> },
          { path: "/admin/users", element: <UserCrudPage /> },
          { path: "/admin/products", element: <ProductAdminPage /> },
          { path: "/admin/inbox", element: <ChatList /> },
          { path: "/admin/inbox/:id", element: <MessagePage /> },
          { path: "/admin/products/create", element: <ProductCreate /> },
          { path: "/admin/products/edit/:id", element: <ProductEdit /> },
          { path: "/admin/products/colors", element: <ColorManagement /> },
          { path: "/admin/products/sizes", element: <SizeManagement /> },
          { path: "/admin/products/categories", element: <CategoryManagement /> },
          { path: "/admin/products/gender", element: <GenderManagement /> },
          { path: "/admin/products/badges", element: <BadgeManagement /> },
          { path: "/admin/products/coupons", element: <CouponManagement /> },
          { path: "/admin/products/slides", element: <SliderManagement /> },
          { path: "/admin/products/related", element: <RelatedProductManagement /> },
        ],
      },
    ],
  },
]);
