import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "../src/pages/dashboard";
import Inquilinos from "../src/pages/inquilinos";
import Consulta from "../src/pages/consultaConsumo";
import RegistrarConsumo from "../src/pages/registrarConsumo";
//import Energia from "../pages/Energia";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inquilinos" element={<Inquilinos />} />
        <Route path="/consulta" element={<Consulta />} />
        <Route path="/registro" element={<RegistrarConsumo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

//<Route path="/energia" element={<Energia />} />
