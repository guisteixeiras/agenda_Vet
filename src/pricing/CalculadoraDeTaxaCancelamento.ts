const UMA_HORA_MS = 60 * 60 * 1000;

export class CalculadoraDeTaxaCancelamento {
  calcular(valor: number, inicio: Date, momentoCancelamento: Date, _planoPetMais: boolean): number {
    const horas = (inicio.getTime() - momentoCancelamento.getTime()) / UMA_HORA_MS;
    if (horas >= 24) return 0;
    if (horas >= 2) return valor * 0.3;
    return valor * 0.5;
  }
}
