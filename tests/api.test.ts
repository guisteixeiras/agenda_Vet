import request from 'supertest';
import { criarApp } from '../src/app';
import { montarFacade } from '../src/montagem';

describe('API /consultas', () => {
  // Relógio fixo: os testes não "vencem" quando a data de exemplo passar.
  const agora = () => new Date('2026-12-01T10:00:00');
  let app: ReturnType<typeof criarApp>;

  const valida = {
    tutor: 'Ana', telefone: '31999990000', pet: 'Thor',
    tipo: 'CONSULTA', dataHora: '2027-01-10T14:00:00',
  };

  beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => undefined));
  afterAll(() => jest.restoreAllMocks());
  beforeEach(() => {
    app = criarApp(montarFacade(), { agora });
  });

  describe('POST /consultas', () => {
    it('cria consulta e devolve 201 com valor calculado', async () => {
      const res = await request(app).post('/consultas').send(valida);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ id: 1, valor: 120, status: 'AGENDADA', planoPetMais: false });
    });

    it('ignora o valor e o status enviados pelo cliente', async () => {
      const res = await request(app).post('/consultas').send({ ...valida, valor: 0, status: 'CANCELADA' });
      expect(res.status).toBe(201);
      expect(res.body.valor).toBe(120);
      expect(res.body.status).toBe('AGENDADA');
    });

    it('aplica o desconto do Plano Pet+', async () => {
      const res = await request(app).post('/consultas').send({ ...valida, planoPetMais: true });
      expect(res.body.valor).toBe(96);
    });

    it('aceita telefone com 10 e com 11 dígitos (limites válidos)', async () => {
      const dez = await request(app).post('/consultas').send({ ...valida, telefone: '3133334444' });
      const onze = await request(app).post('/consultas').send({ ...valida, telefone: '31999990000' });
      expect([dez.status, onze.status]).toEqual([201, 201]);
    });

    it.each(['319999900', '319999900001'])('recusa telefone %s (9 ou 12 dígitos)', async (telefone) => {
      const res = await request(app).post('/consultas').send({ ...valida, telefone });
      expect(res.status).toBe(400);
      expect(res.body.erros).toHaveLength(1);
    });

    it('recusa tutor com 2 caracteres e aceita com 3 (valor-limite)', async () => {
      const curto = await request(app).post('/consultas').send({ ...valida, tutor: 'Al' });
      const minimo = await request(app).post('/consultas').send({ ...valida, tutor: 'Ana' });
      expect(curto.status).toBe(400);
      expect(minimo.status).toBe(201);
    });

    it('recusa tipo fora do enum', async () => {
      const res = await request(app).post('/consultas').send({ ...valida, tipo: 'TOSA' });
      expect(res.status).toBe(400);
    });

    it('recusa data no passado', async () => {
      const res = await request(app).post('/consultas').send({ ...valida, dataHora: '2026-11-30T10:00:00' });
      expect(res.status).toBe(400);
    });

    it('recusa data em formato não ISO', async () => {
      const res = await request(app).post('/consultas').send({ ...valida, dataHora: '10/01/2027 14:00' });
      expect(res.status).toBe(400);
    });

    it('recusa planoPetMais que não é booleano', async () => {
      const res = await request(app).post('/consultas').send({ ...valida, planoPetMais: 'sim' });
      expect(res.status).toBe(400);
    });

    it('corpo vazio lista vários erros de uma vez', async () => {
      const res = await request(app).post('/consultas').send({});
      expect(res.status).toBe(400);
      expect(res.body.erros.length).toBeGreaterThanOrEqual(5);
    });

    it('JSON malformado devolve 400', async () => {
      const res = await request(app).post('/consultas').set('Content-Type', 'application/json').send('{ruim');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /consultas', () => {
    it('lista as consultas criadas', async () => {
      await request(app).post('/consultas').send(valida);
      await request(app).post('/consultas').send({ ...valida, tipo: 'VACINA' });
      const res = await request(app).get('/consultas');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('busca consulta por id', async () => {
      await request(app).post('/consultas').send(valida);
      const res = await request(app).get('/consultas/1');
      expect(res.status).toBe(200);
      expect(res.body.pet).toBe('Thor');
    });

    it('devolve 404 para id inexistente', async () => {
      const res = await request(app).get('/consultas/999');
      expect(res.status).toBe(404);
    });

    it('devolve 400 para id não numérico', async () => {
      const res = await request(app).get('/consultas/abc');
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /consultas/:id', () => {
    it('cancela e devolve a taxa de cancelamento', async () => {
      await request(app).post('/consultas').send(valida);
      const res = await request(app).delete('/consultas/1');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 'CANCELADA', taxaCancelamento: 0 });
    });

    it('DELETE duas vezes seguidas devolve 409', async () => {
      await request(app).post('/consultas').send(valida);
      await request(app).delete('/consultas/1');
      const res = await request(app).delete('/consultas/1');
      expect(res.status).toBe(409);
    });

    it('devolve 404 ao cancelar id inexistente', async () => {
      const res = await request(app).delete('/consultas/999');
      expect(res.status).toBe(404);
    });

    it('devolve 400 ao cancelar com id não numérico', async () => {
      const res = await request(app).delete('/consultas/abc');
      expect(res.status).toBe(400);
    });
  });
});
