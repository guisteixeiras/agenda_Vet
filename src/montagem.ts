import { ClinicaFacade } from './facade/ClinicaFacade';
import { ZapLegacySDK } from './libs/zap-legacy-sdk';
import { EmailFakeNotificador } from './notifications/EmailFakeNotificador';
import { INotificador } from './notifications/INotificador';
import { NotificadorComposto } from './notifications/NotificadorComposto';
import { ZapAdapter } from './notifications/ZapAdapter';
import { CalculadoraDePreco } from './pricing/CalculadoraDePreco';
import { CalculadoraDeTaxaCancelamento } from './pricing/CalculadoraDeTaxaCancelamento';
import { PrecoBanhoTosa, PrecoCirurgia, PrecoConsulta, PrecoVacina } from './pricing/regras';
import { RepositorioEmMemoria } from './repositories/RepositorioEmMemoria';

/** Composição: o único lugar que conhece as classes concretas. */
export function montarFacade(): ClinicaFacade {
  const repositorio = new RepositorioEmMemoria();
  const calculadora = new CalculadoraDePreco([
    new PrecoConsulta(),
    new PrecoVacina(),
    new PrecoCirurgia(),
    new PrecoBanhoTosa(),
  ]);
  const notificador: INotificador = new NotificadorComposto([
    new ZapAdapter(new ZapLegacySDK(process.env.ZAP_TOKEN ?? 'TOKEN-123')),
    new EmailFakeNotificador(),
  ]);
  return new ClinicaFacade(repositorio, calculadora, notificador, new CalculadoraDeTaxaCancelamento());
}
