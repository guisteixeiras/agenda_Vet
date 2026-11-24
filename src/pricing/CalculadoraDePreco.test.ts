import { TipoAtendimento } from '../domain/TipoAtendimento';
import { CalculadoraDePreco } from './CalculadoraDePreco';
import { DescontoPlanoPet } from './DescontoPlanoPet';
import { PrecoBanhoTosa, PrecoCirurgia, PrecoConsulta, PrecoVacina } from './regras';

describe('CalculadoraDePreco', () => {
  const calc = new CalculadoraDePreco([
    new PrecoConsulta(), new PrecoVacina(), new PrecoCirurgia(), new PrecoBanhoTosa(),
  ]);

  it.each([
    [TipoAtendimento.CONSULTA, 120],
    [TipoAtendimento.VACINA, 80],
    [TipoAtendimento.CIRURGIA, 540],
    [TipoAtendimento.BANHO_TOSA, 65],
  ])('%s custa R$ %d', (tipo, preco) => {
    expect(calc.calcular(tipo)).toBe(preco);
  });

  it('aplica 20% de desconto do Plano Pet+ em qualquer serviço', () => {
    expect(calc.calcular(TipoAtendimento.CIRURGIA, true)).toBe(432);
    expect(calc.calcular(TipoAtendimento.BANHO_TOSA, true)).toBe(52);
  });

  it('lança erro para tipo sem regra registrada', () => {
    const semCirurgia = new CalculadoraDePreco([new PrecoConsulta()]);
    expect(() => semCirurgia.calcular(TipoAtendimento.CIRURGIA)).toThrow('não suportado');
  });
});

describe('DescontoPlanoPet (Decorator)', () => {
  it('mantém o tipo da regra embrulhada', () => {
    expect(new DescontoPlanoPet(new PrecoVacina()).tipo).toBe(TipoAtendimento.VACINA);
  });

  it('pode ser empilhado como camadas de cebola', () => {
    const duplo = new DescontoPlanoPet(new DescontoPlanoPet(new PrecoConsulta()));
    expect(duplo.calcular()).toBe(76.8);
  });
});
