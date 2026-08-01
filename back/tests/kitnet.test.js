const validarKitnet = require("../src/utils/validarKitnet");

describe("Consulta de Kitnets", () => {
  test("Buscar kitnet com ID válido", () => {
    expect(validarKitnet(1)).toBe(true);
  });

  test("Buscar kitnet com ID inexistente", () => {
    expect(validarKitnet(0)).toBe(false);
  });
});
