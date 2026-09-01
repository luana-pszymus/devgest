import { BrowserRouter, Routes, Route } from "react-router-dom";

// Correção dos caminhos relativos:
import Dashboard from "../pages/dashboard";
import Inquilinos from "../pages/inquilinos";
import Consulta from "../pages/consultaConsumo";
import RegistrarConsumo from "../pages/registrarConsumo";
// import Energia from "../pages/Energia";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inquilinos" element={<Inquilinos />} />
        <Route path="/consulta" element={<Consulta />} />
        <Route path="/registro" element={<RegistrarConsumo />} />
        {/* <Route path="/energia" element={<Energia />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;