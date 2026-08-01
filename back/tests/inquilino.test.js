const validarCPF = require("../src/utils/validarCPF");

describe("Validação de CPF", () => {
  test("CPF válido deve retornar true", () => {
    expect(validarCPF("12345678901")).toBe(true);
  });

  test("CPF inválido deve retornar false", () => {
    expect(validarCPF("123")).toBe(false);
  });
});
