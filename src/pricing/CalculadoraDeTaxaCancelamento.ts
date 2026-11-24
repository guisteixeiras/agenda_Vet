const UMA_HORA_MS = 60 * 60 * 1000;

export class CalculadoraDeTaxaCancelamento {
  calcular(valor: number, inicio: Date, momentoCancelamento: Date, planoPetMais: boolean): number {
    if (valor <= 0) throw new Error('Valor inválido');
    const horas = (inicio.getTime() - momentoCancelamento.getTime()) / UMA_HORA_MS;
    let taxa: number;
    if (horas >= 24) taxa = 0;
    else if (horas >= 2) taxa = valor * 0.3;
    else if (horas > 0) taxa = valor * 0.5;
    else taxa = valor;
    return planoPetMais ? taxa / 2 : taxa;
  }
}
