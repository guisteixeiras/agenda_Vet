import { NovaConsulta } from '../domain/Consulta';
import { TipoAtendimento } from '../domain/TipoAtendimento';

const TAMANHO_MINIMO_TUTOR = 3;
const TELEFONE_VALIDO = /^\d{10,11}$/; // DDD + número, só dígitos
const DATA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/;
const TIPOS_VALIDOS = Object.values(TipoAtendimento) as string[];

export type ResultadoValidacao =
  | { valido: true; dados: NovaConsulta }
  | { valido: false; erros: string[] };

/** Não confie no input: valida tudo e monta um objeto só com os campos conhecidos. */
export function validarNovaConsulta(corpo: unknown, agora: Date): ResultadoValidacao {
  const entrada = (typeof corpo === 'object' && corpo !== null ? corpo : {}) as Record<string, unknown>;
  const erros: string[] = [];
  const { tutor, telefone, pet, tipo, dataHora, planoPetMais } = entrada;

  if (typeof tutor !== 'string' || tutor.trim().length < TAMANHO_MINIMO_TUTOR) {
    erros.push(`tutor deve ter pelo menos ${TAMANHO_MINIMO_TUTOR} caracteres`);
  }
  if (typeof telefone !== 'string' || !TELEFONE_VALIDO.test(telefone)) {
    erros.push('telefone deve ter 10 ou 11 dígitos, só números');
  }
  if (typeof pet !== 'string' || pet.trim().length === 0) {
    erros.push('pet é obrigatório');
  }
  if (typeof tipo !== 'string' || !TIPOS_VALIDOS.includes(tipo)) {
    erros.push(`tipo deve ser um de: ${TIPOS_VALIDOS.join(', ')}`);
  }

  const data = typeof dataHora === 'string' && DATA_ISO.test(dataHora) ? new Date(dataHora) : undefined;
  if (!data || isNaN(data.getTime())) {
    erros.push('dataHora deve estar no formato ISO (ex.: 2027-01-10T14:00:00)');
  } else if (data.getTime() <= agora.getTime()) {
    erros.push('dataHora deve estar no futuro');
  }

  if (planoPetMais !== undefined && typeof planoPetMais !== 'boolean') {
    erros.push('planoPetMais deve ser booleano');
  }

  if (erros.length > 0) return { valido: false, erros };

  return {
    valido: true,
    dados: {
      tutor: (tutor as string).trim(),
      telefone: telefone as string,
      pet: (pet as string).trim(),
      tipo: tipo as TipoAtendimento,
      dataHora: data as Date,
      planoPetMais: (planoPetMais as boolean | undefined) ?? false,
    },
  };
}
