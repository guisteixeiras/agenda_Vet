import { TipoAtendimento } from './domain/TipoAtendimento';
import { ClinicaFacade } from './facade/ClinicaFacade';
import { ZapLegacySDK } from './libs/zap-legacy-sdk';
import { ZapAdapter } from './notifications/ZapAdapter';
import { CalculadoraDePreco } from './pricing/CalculadoraDePreco';
import { PrecoBanhoTosa, PrecoCirurgia, PrecoConsulta, PrecoVacina } from './pricing/regras';
import { RepositorioEmMemoria } from './repositories/RepositorioEmMemoria';

// Composição: o único lugar que conhece as classes concretas.
const repositorio = new RepositorioEmMemoria();
const calculadora = new CalculadoraDePreco([
  new PrecoConsulta(),
  new PrecoVacina(),
  new PrecoCirurgia(),
  new PrecoBanhoTosa(),
]);
const notificador = new ZapAdapter(new ZapLegacySDK(process.env.ZAP_TOKEN ?? 'TOKEN-123'));
const clinica = new ClinicaFacade(repositorio, calculadora, notificador);

clinica.agendar({
  tutor: 'Ana', telefone: '31999990000', pet: 'Thor',
  tipo: TipoAtendimento.CONSULTA, dataHora: new Date('2027-01-10T14:00:00'), planoPetMais: false,
});
clinica.agendar({
  tutor: 'Bruno', telefone: '31988887777', pet: 'Mel',
  tipo: TipoAtendimento.CIRURGIA, dataHora: new Date('2027-01-11T09:30:00'), planoPetMais: true,
});
clinica.agendar({
  tutor: 'Carla', telefone: '31977776666', pet: 'Pipoca',
  tipo: TipoAtendimento.BANHO_TOSA, dataHora: new Date('2027-01-12T16:00:00'), planoPetMais: false,
});

console.table(clinica.listar().map(({ id, tutor, pet, tipo, valor, status }) => ({ id, tutor, pet, tipo, valor, status })));
