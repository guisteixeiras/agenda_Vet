import express, { NextFunction, Request, Response } from 'express';
import { validarNovaConsulta } from './api/validacao';
import { ConsultaJaCanceladaError, ConsultaNaoEncontradaError, DadosInvalidosError } from './domain/erros';
import { ClinicaFacade } from './facade/ClinicaFacade';

const ID_NUMERICO = /^\d+$/;

export interface OpcoesApp {
  /** Relógio injetável: permite testar "data no futuro" e taxa de cancelamento sem depender do dia de hoje. */
  agora?: () => Date;
}

export function criarApp(facade: ClinicaFacade, opcoes: OpcoesApp = {}) {
  const agora = opcoes.agora ?? (() => new Date());
  const app = express();
  app.use(express.json());

  app.post('/consultas', (req, res) => {
    const resultado = validarNovaConsulta(req.body, agora());
    if (!resultado.valido) {
      res.status(400).json({ erros: resultado.erros });
      return;
    }
    res.status(201).json(facade.agendar(resultado.dados));
  });

  app.get('/consultas', (_req, res) => {
    res.status(200).json(facade.listar());
  });

  app.get('/consultas/:id', (req, res) => {
    const id = lerId(req.params.id);
    if (id === undefined) {
      res.status(400).json({ erros: ['id deve ser numérico'] });
      return;
    }
    const consulta = facade.listar().find(c => c.id === id);
    if (!consulta) {
      res.status(404).json({ erro: `Consulta ${id} não encontrada` });
      return;
    }
    res.status(200).json(consulta);
  });

  app.delete('/consultas/:id', (req, res) => {
    const id = lerId(req.params.id);
    if (id === undefined) {
      res.status(400).json({ erros: ['id deve ser numérico'] });
      return;
    }
    res.status(200).json(facade.cancelar(id, agora()));
  });

  app.use(tratarErros);
  return app;
}

function lerId(valor: string): number | undefined {
  return ID_NUMERICO.test(valor) ? Number(valor) : undefined;
}

function tratarErros(erro: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) {
  if (erro instanceof ConsultaNaoEncontradaError) {
    res.status(404).json({ erro: erro.message });
  } else if (erro instanceof ConsultaJaCanceladaError) {
    res.status(409).json({ erro: erro.message });
  } else if (erro instanceof DadosInvalidosError) {
    res.status(400).json({ erros: [erro.message] });
  } else if (erro.type === 'entity.parse.failed') {
    res.status(400).json({ erros: ['JSON inválido'] });
  } else {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno' });
  }
}
