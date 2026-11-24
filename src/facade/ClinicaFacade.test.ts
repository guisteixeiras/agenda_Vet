import { NovaConsulta } from '../domain/Consulta';
import { TipoAtendimento } from '../domain/TipoAtendimento';
import { INotificador } from '../notifications/INotificador';
import { CalculadoraDePreco } from '../pricing/CalculadoraDePreco';
import { PrecoCirurgia, PrecoConsulta, PrecoVacina } from '../pricing/regras';
import { RepositorioEmMemoria } from '../repositories/RepositorioEmMemoria';
import { ClinicaFacade } from './ClinicaFacade';

describe('ClinicaFacade', () => {
  const notificador: INotificador = { enviar: jest.fn() };
  let facade: ClinicaFacade;

  const dadosValidos: NovaConsulta = {
    tutor: 'Ana', telefone: '31999990000', pet: 'Thor',
    tipo: TipoAtendimento.CONSULTA, dataHora: new Date('2027-01-10T14:00:00'),
    planoPetMais: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const repositorio = new RepositorioEmMemoria(); // stub simples e real
    const calculadora = new CalculadoraDePreco([new PrecoConsulta(), new PrecoVacina(), new PrecoCirurgia()]);
    facade = new ClinicaFacade(repositorio, calculadora, notificador);
  });

  it('notifica o tutor uma única vez ao agendar', () => {
    facade.agendar(dadosValidos);
    expect(notificador.enviar).toHaveBeenCalledTimes(1);
    expect(notificador.enviar).toHaveBeenCalledWith('31999990000', expect.stringContaining('Thor'));
  });

  it('envia a mensagem no formato combinado com a clínica', () => {
    facade.agendar(dadosValidos);
    expect(notificador.enviar).toHaveBeenCalledWith(
      '31999990000',
      'Olá Ana! A consulta do Thor foi agendada para 10/01/2027 14:00. Valor: R$ 120,00',
    );
  });

  it('não notifica ninguém quando os dados são inválidos', () => {
    expect(() => facade.agendar({ ...dadosValidos, tutor: '' })).toThrow('tutor');
    expect(notificador.enviar).not.toHaveBeenCalled();
  });

  it('lista todos os campos inválidos na mensagem de erro', () => {
    const invalida = { ...dadosValidos, telefone: '', pet: '', dataHora: new Date('xx') };
    expect(() => facade.agendar(invalida)).toThrow('telefone, pet, dataHora');
  });

  it('aplica 20% de desconto do Plano Pet+ (R$ 96)', () => {
    const consulta = facade.agendar({ ...dadosValidos, planoPetMais: true });
    expect(consulta.valor).toBe(96);
  });

  it('salva a consulta com status AGENDADA e id gerado pelo repositório', () => {
    const consulta = facade.agendar(dadosValidos);
    expect(consulta).toMatchObject({ id: 1, status: 'AGENDADA', valor: 120 });
    expect(facade.listar()).toHaveLength(1);
  });

  it('lança erro ao cancelar consulta inexistente', () => {
    expect(() => facade.cancelar(999)).toThrow('Consulta 999 não encontrada');
  });

  it('cancela com taxa de acordo com a antecedência', () => {
    const { id } = facade.agendar(dadosValidos);
    const umaHoraAntes = new Date('2027-01-10T13:00:00');
    const cancelada = facade.cancelar(id, umaHoraAntes);
    expect(cancelada).toMatchObject({ status: 'CANCELADA', taxaCancelamento: 60 });
  });

  it('não permite cancelar duas vezes', () => {
    const { id } = facade.agendar(dadosValidos);
    const doisDiasAntes = new Date('2027-01-08T14:00:00');
    facade.cancelar(id, doisDiasAntes);
    expect(() => facade.cancelar(id, doisDiasAntes)).toThrow('já está cancelada');
  });

  it('propaga erro de tipo não suportado sem notificar', () => {
    const tipoInexistente = 'TOSA' as TipoAtendimento;
    expect(() => facade.agendar({ ...dadosValidos, tipo: tipoInexistente })).toThrow('não suportado');
    expect(notificador.enviar).not.toHaveBeenCalled();
  });
});
