const validarContrato = require("../src/utils/validarContrato");

describe("Consulta de Contratos", () => {
  test("Buscar contrato com ID válido", () => {
    expect(validarContrato(10)).toBe(true);
  });

  test("Buscar contrato com ID inválido", () => {
    expect(validarContrato(0)).toBe(false);
  });
});
