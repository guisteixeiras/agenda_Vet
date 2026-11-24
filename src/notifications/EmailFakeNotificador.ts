import { INotificador } from './INotificador';

/** Canal de e-mail simulado (desafio extra). */
export class EmailFakeNotificador implements INotificador {
  enviar(telefone: string, mensagem: string): void {
    console.log(`[EMAIL fake] tutor ${telefone}: ${mensagem}`);
  }
}
