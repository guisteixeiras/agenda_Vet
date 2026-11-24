import { criarApp } from './app';
import { TipoAtendimento } from './domain/TipoAtendimento';
import { montarFacade } from './montagem';

const PORTA = Number(process.env.PORT ?? 3000);
const facade = montarFacade();

// Consultas de demonstração (uma com Plano Pet+ e uma de BANHO_TOSA).
facade.agendar({
  tutor: 'Ana', telefone: '31999990000', pet: 'Thor',
  tipo: TipoAtendimento.CONSULTA, dataHora: new Date('2027-01-10T14:00:00'), planoPetMais: false,
});
facade.agendar({
  tutor: 'Bruno', telefone: '31988887777', pet: 'Mel',
  tipo: TipoAtendimento.CIRURGIA, dataHora: new Date('2027-01-11T09:30:00'), planoPetMais: true,
});
facade.agendar({
  tutor: 'Carla', telefone: '31977776666', pet: 'Pipoca',
  tipo: TipoAtendimento.BANHO_TOSA, dataHora: new Date('2027-01-12T16:00:00'), planoPetMais: false,
});

criarApp(facade).listen(PORTA, () => console.log(`AgendaVet em http://localhost:${PORTA}`));
