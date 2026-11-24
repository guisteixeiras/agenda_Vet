import { Consulta, NovaConsulta } from '../domain/Consulta';
import { ConsultaJaCanceladaError, ConsultaNaoEncontradaError, DadosInvalidosError } from '../domain/erros';
import { CalculadoraDePreco } from '../pricing/CalculadoraDePreco';
import { CalculadoraDeTaxaCancelamento } from '../pricing/CalculadoraDeTaxaCancelamento';
import { IRepositorioConsultas } from '../repositories/IRepositorioConsultas';
import { INotificador } from '../notifications/INotificador';

/** Facade: única porta de entrada do sistema (a "recepcionista"). */
export class ClinicaFacade {
  constructor(
    private readonly repositorio: IRepositorioConsultas,
    private readonly calculadora: CalculadoraDePreco,
    private readonly notificador: INotificador,
    private readonly calculadoraDeTaxa = new CalculadoraDeTaxaCancelamento(),
  ) {}

  agendar(dados: NovaConsulta): Consulta {
    this.validar(dados);
    const valor = this.calculadora.calcular(dados.tipo, dados.planoPetMais);
    const consulta = this.repositorio.salvar({ ...dados, valor, status: 'AGENDADA' });
    this.notificador.enviar(consulta.telefone, this.mensagemDeAgendamento(consulta));
    return consulta;
  }

  cancelar(id: number, agora: Date = new Date()): Consulta {
    const consulta = this.repositorio.buscarPorId(id);
    if (!consulta) throw new ConsultaNaoEncontradaError(id);
    if (consulta.status === 'CANCELADA') throw new ConsultaJaCanceladaError(id);
    const taxaCancelamento = this.calculadoraDeTaxa.calcular(
      consulta.valor, consulta.dataHora, agora, consulta.planoPetMais,
    );
    const cancelada: Consulta = { ...consulta, status: 'CANCELADA', taxaCancelamento };
    this.repositorio.atualizar(cancelada);
    return cancelada;
  }

  listar(): Consulta[] {
    return this.repositorio.listar();
  }

  private validar(dados: NovaConsulta): void {
    const faltando: string[] = [];
    if (!dados.tutor?.trim()) faltando.push('tutor');
    if (!dados.telefone?.trim()) faltando.push('telefone');
    if (!dados.pet?.trim()) faltando.push('pet');
    if (!dados.tipo) faltando.push('tipo');
    if (!(dados.dataHora instanceof Date) || isNaN(dados.dataHora.getTime())) faltando.push('dataHora');
    if (faltando.length > 0) {
      throw new DadosInvalidosError(`Campos obrigatórios ausentes ou inválidos: ${faltando.join(', ')}`);
    }
  }

  private mensagemDeAgendamento(consulta: Consulta): string {
    return `Olá ${consulta.tutor}! A consulta do ${consulta.pet} foi agendada para ` +
      `${formatarDataHora(consulta.dataHora)}. Valor: ${formatarMoeda(consulta.valor)}`;
  }
}

const doisDigitos = (n: number) => String(n).padStart(2, '0');

function formatarDataHora(data: Date): string {
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()} ` +
    `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

function formatarMoeda(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}
