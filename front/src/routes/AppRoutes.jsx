import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "../pages/dashboard";
import Inquilinos from "../pages/inquilinos";
import Consulta from "../pages/consultaConsumo";
import RegistrarConsumo from "../pages/registrarConsumo";
import Login from "../pages/login";

import PrivateRoute from "../components/PrivateRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Páginas protegidas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/inquilinos"
          element={
            <PrivateRoute>
              <Inquilinos />
            </PrivateRoute>
          }
        />

        <Route
          path="/consulta"
          element={
            <PrivateRoute>
              <Consulta />
            </PrivateRoute>
          }
        />

        <Route
          path="/registro"
          element={
            <PrivateRoute>
              <RegistrarConsumo />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
