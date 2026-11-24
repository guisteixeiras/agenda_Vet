import { INotificador } from './INotificador';

/** Composite: repassa a mensagem para todos os canais. A Facade não muda (OCP + DIP). */
export class NotificadorComposto implements INotificador {
  constructor(private readonly canais: INotificador[]) {}

  enviar(telefone: string, mensagem: string): void {
    this.canais.forEach(canal => canal.enviar(telefone, mensagem));
  }
}
