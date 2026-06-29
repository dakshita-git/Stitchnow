import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Boutiques from "./pages/Boutiques.jsx";
import BoutiqueDetails from "./pages/BoutiqueDetails.jsx";
import Booking from "./pages/Booking.jsx";
import Orders from "./pages/Orders.jsx";
import BoutiqueDashboard from "./pages/BoutiqueDashboard.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./style.css";
import AddBoutique from "./pages/AddBoutique.jsx";
import AddReview from "./pages/AddReview.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="boutiques" element={<Boutiques />} />
          <Route path="boutiques/:id" element={<BoutiqueDetails />} />
          <Route path="book/:boutiqueId/:serviceId" element={<Booking />} />
          <Route path="orders" element={<Orders />} />
          <Route path="dashboard" element={<BoutiqueDashboard />} />
          <Route path="add-boutique" element={<AddBoutique />} />
          <Route path="review/:boutiqueId" element={<AddReview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>,
);
