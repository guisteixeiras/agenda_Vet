import { TipoAtendimento } from '../domain/TipoAtendimento';
import { RepositorioEmMemoria } from './RepositorioEmMemoria';

describe('RepositorioEmMemoria', () => {
  const dados = {
    tutor: 'Ana', telefone: '31999990000', pet: 'Thor', tipo: TipoAtendimento.CONSULTA,
    dataHora: new Date('2027-01-10T14:00:00'), planoPetMais: false, valor: 120, status: 'AGENDADA' as const,
  };

  it('gera ids sequenciais com contador próprio', () => {
    const repo = new RepositorioEmMemoria();
    expect(repo.salvar(dados).id).toBe(1);
    expect(repo.salvar(dados).id).toBe(2);
  });

  it('lança erro ao atualizar consulta que não existe', () => {
    const repo = new RepositorioEmMemoria();
    expect(() => repo.atualizar({ ...dados, id: 42 })).toThrow('não encontrada');
  });

  it('devolve cópias: alterar o retorno não altera o que está salvo', () => {
    const repo = new RepositorioEmMemoria();
    const salva = repo.salvar(dados);
    salva.status = 'CANCELADA';
    expect(repo.buscarPorId(salva.id)?.status).toBe('AGENDADA');
  });
});
