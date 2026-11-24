import { ZapLegacySDK } from '../libs/zap-legacy-sdk';
import { INotificador } from './INotificador';
import { NotificadorComposto } from './NotificadorComposto';
import { ZapAdapter } from './ZapAdapter';

describe('ZapAdapter', () => {
  it('acrescenta o DDI 55 e traduz para dispararMsg', () => {
    const sdk = new ZapLegacySDK('TESTE');
    const disparar = jest.spyOn(sdk, 'dispararMsg').mockReturnValue({ ok: true });
    new ZapAdapter(sdk).enviar('31999990000', 'oi');
    expect(disparar).toHaveBeenCalledWith('5531999990000', { txt: 'oi' });
  });

  it('lança erro quando a SDK responde ok: false', () => {
    const sdk = new ZapLegacySDK('TESTE');
    jest.spyOn(sdk, 'dispararMsg').mockReturnValue({ ok: false });
    expect(() => new ZapAdapter(sdk).enviar('31999990000', 'oi')).toThrow('Falha ao notificar');
  });
});

describe('NotificadorComposto', () => {
  it('envia por todos os canais', () => {
    const canalA: INotificador = { enviar: jest.fn() };
    const canalB: INotificador = { enviar: jest.fn() };
    new NotificadorComposto([canalA, canalB]).enviar('31999990000', 'oi');
    expect(canalA.enviar).toHaveBeenCalledWith('31999990000', 'oi');
    expect(canalB.enviar).toHaveBeenCalledWith('31999990000', 'oi');
  });
});
