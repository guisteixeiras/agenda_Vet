import { CalculadoraDeTaxaCancelamento } from './CalculadoraDeTaxaCancelamento';

describe('CalculadoraDeTaxaCancelamento', () => {
  const calc = new CalculadoraDeTaxaCancelamento();
  const inicio = new Date('2027-01-10T14:00:00');
  const antes = (horas: number, minutos = 0) =>
    new Date(inicio.getTime() - (horas * 60 + minutos) * 60_000);

  it('não cobra taxa com 48h de antecedência (classe de equivalência)', () => {
    expect(calc.calcular(120, inicio, antes(48), false)).toBe(0);
  });

  it('não cobra taxa com 24h exatas (valor-limite)', () => {
    expect(calc.calcular(120, inicio, antes(24), false)).toBe(0);
  });
});
