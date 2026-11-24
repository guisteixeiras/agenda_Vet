const UMA_HORA_MS = 60 * 60 * 1000;
const HORAS_SEM_TAXA = 24;
const HORAS_TAXA_PARCIAL = 2;

const PERCENTUAL_SEM_TAXA = 0;
const PERCENTUAL_TAXA_PARCIAL = 0.3;
const PERCENTUAL_EM_CIMA_DA_HORA = 0.5;
const PERCENTUAL_NAO_COMPARECEU = 1;
const FATOR_PLANO_PET = 0.5;

export class CalculadoraDeTaxaCancelamento {
  calcular(valor: number, inicio: Date, momentoCancelamento: Date, planoPetMais: boolean): number {
    if (valor <= 0) throw new Error('Valor inválido');
    const horasDeAntecedencia = (inicio.getTime() - momentoCancelamento.getTime()) / UMA_HORA_MS;
    const percentual = this.percentualPorAntecedencia(horasDeAntecedencia);
    const fatorPlano = planoPetMais ? FATOR_PLANO_PET : 1;
    return arredondarCentavos(valor * percentual * fatorPlano);
  }

  private percentualPorAntecedencia(horas: number): number {
    if (horas >= HORAS_SEM_TAXA) return PERCENTUAL_SEM_TAXA;
    if (horas >= HORAS_TAXA_PARCIAL) return PERCENTUAL_TAXA_PARCIAL;
    if (horas > 0) return PERCENTUAL_EM_CIMA_DA_HORA;
    return PERCENTUAL_NAO_COMPARECEU;
  }
}

function arredondarCentavos(valor: number): number {
  return Math.round(valor * 100) / 100;
}
