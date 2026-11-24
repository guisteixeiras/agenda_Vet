import { TipoAtendimento } from '../domain/TipoAtendimento';
import { RegraDePreco } from './RegraDePreco';

export class CalculadoraDePreco {
  constructor(private readonly regras: RegraDePreco[]) {}

  calcular(tipo: TipoAtendimento): number {
    const regra = this.regras.find(r => r.tipo === tipo);
    if (!regra) throw new Error(`Tipo de atendimento não suportado: ${tipo}`);
    return regra.calcular();
  }
}
