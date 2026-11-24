import { RegraDePreco } from './RegraDePreco';

const FATOR_DESCONTO_PLANO_PET = 0.8; // 20% de desconto

/** Decorator: embrulha qualquer regra e aplica o desconto do Plano Pet+. */
export class DescontoPlanoPet implements RegraDePreco {
  constructor(private readonly regraOriginal: RegraDePreco) {}

  get tipo() {
    return this.regraOriginal.tipo;
  }

  calcular(): number {
    return Math.round(this.regraOriginal.calcular() * FATOR_DESCONTO_PLANO_PET * 100) / 100;
  }
}
