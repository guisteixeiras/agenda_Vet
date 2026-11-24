import { TipoAtendimento } from './TipoAtendimento';

export type StatusConsulta = 'AGENDADA' | 'CANCELADA';

export interface NovaConsulta {
  tutor: string;
  telefone: string; // só dígitos, com DDD: 31999990000
  pet: string;
  tipo: TipoAtendimento;
  dataHora: Date;
  planoPetMais: boolean;
}

export interface Consulta extends NovaConsulta {
  id: number;
  valor: number;
  status: StatusConsulta;
  taxaCancelamento?: number;
}
