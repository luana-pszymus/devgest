function calcularValores(consumoKwh, precoKwh, valorAluguel) {
  const valorEnergia = consumoKwh * precoKwh;
  const valorTotal = valorEnergia + valorAluguel;

  return { valorEnergia, valorTotal };
}

module.exports = { calcularValores };
