import { Consulta } from '../domain/Consulta';
import { IRepositorioConsultas } from './IRepositorioConsultas';

export class RepositorioEmMemoria implements IRepositorioConsultas {
  private readonly consultas = new Map<number, Consulta>();
  private proximoId = 1;

  salvar(dados: Omit<Consulta, 'id'>): Consulta {
    const consulta: Consulta = { ...dados, id: this.proximoId++ };
    this.consultas.set(consulta.id, consulta);
    return { ...consulta };
  }

  buscarPorId(id: number): Consulta | undefined {
    const consulta = this.consultas.get(id);
    return consulta ? { ...consulta } : undefined;
  }

  atualizar(consulta: Consulta): void {
    if (!this.consultas.has(consulta.id)) {
      throw new Error(`Consulta ${consulta.id} não encontrada`);
    }
    this.consultas.set(consulta.id, { ...consulta });
  }

  listar(): Consulta[] {
    return [...this.consultas.values()].map(c => ({ ...c }));
  }
}
