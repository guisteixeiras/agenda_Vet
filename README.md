# AgendaVet — API de Agendamento

Projeto Prático 1 — Engenharia de Software II (Univértix).
Refatoração do sistema legado da clínica veterinária AgendaVet aplicando Clean Code, SOLID e Padrões de Projeto (Parte 1), protegida com TDD, testes de integração, cobertura e Docker (Parte 2).

## Integrantes

- João Vitor Pieroti Pinheiro
- _(dupla)_

## Como rodar

```bash
npm install
npm run dev            # sobe a API em http://localhost:3000 com 3 consultas de demonstração
npm test               # todos os testes
npm run test:coverage  # testes + relatório em coverage/lcov-report/index.html
```

Com Docker:

```bash
docker build -t agendavet .
docker run -p 3000:3000 agendavet
curl http://localhost:3000/consultas
```

## Rotas

| Rota | Sucesso | Erros |
|---|---|---|
| `POST /consultas` | 201 + consulta criada | 400 `{ erros: [...] }` com todas as falhas |
| `GET /consultas` | 200 + lista | — |
| `GET /consultas/:id` | 200 + consulta | 400 id não numérico · 404 não encontrada |
| `DELETE /consultas/:id` | 200 + consulta com `taxaCancelamento` | 400 id não numérico · 404 não encontrada · 409 já cancelada |

Exemplo de corpo do POST:

```json
{ "tutor": "Ana", "telefone": "31999990000", "pet": "Thor", "tipo": "CONSULTA", "dataHora": "2027-01-10T14:00:00", "planoPetMais": false }
```

## Estrutura

```
src/
  domain/         Consulta, TipoAtendimento, erros de domínio
  pricing/        RegraDePreco, regras (Consulta/Vacina/Cirurgia/BanhoTosa), DescontoPlanoPet,
                  CalculadoraDePreco, CalculadoraDeTaxaCancelamento
  repositories/   IRepositorioConsultas, RepositorioEmMemoria
  notifications/  INotificador, ZapAdapter, EmailFakeNotificador, NotificadorComposto
  facade/         ClinicaFacade
  api/            validação de entrada
  libs/           zap-legacy-sdk (terceiros — não alterada)
  legado/         sistema.ts (só para comparação)
  app.ts          criação do app Express (testável sem abrir porta)
  montagem.ts     composição das peças (montarFacade)
  index.ts        sobe o servidor
tests/
  api.test.ts     testes de integração caixa preta (supertest)
```

## Princípios e padrões aplicados

- **SRP:** validar, calcular preço, guardar e notificar ficam em classes separadas.
- **OCP + LSP:** cada serviço é uma `RegraDePreco`; `BANHO_TOSA` entrou sem alterar a `CalculadoraDePreco`.
- **ISP + DIP:** a `ClinicaFacade` depende das interfaces `IRepositorioConsultas` e `INotificador`, recebidas pelo construtor; só `montagem.ts` conhece classes concretas.
- **Adapter:** `ZapAdapter` traduz `enviar(telefone, mensagem)` para `dispararMsg('55' + telefone, { txt })`.
- **Decorator:** `DescontoPlanoPet` embrulha qualquer regra e aplica 20% de desconto.
- **Facade:** `ClinicaFacade` é a única porta de entrada (agendar, cancelar, listar).
- **Desafio extra:** `NotificadorComposto` envia por WhatsApp e e-mail sem mudar a Facade.

## Taxa de cancelamento (TDD)

| Antecedência | Taxa |
|---|---|
| 24h ou mais | 0% |
| 2h (inclusive) até menos de 24h | 30% |
| Mais de 0 e menos de 2h | 50% |
| Zero ou negativa | 100% |
| Plano Pet+ | metade da taxa |
| Valor ≤ 0 | `Error('Valor inválido')` |

## Cobertura

```
=============================== Coverage summary ===============================
Statements   : 97.73% ( 216/221 )
Branches     : 92.3% ( 72/78 )
Functions    : 98.11% ( 52/53 )
Lines        : 98.5% ( 198/201 )
```

O `jest.config.js` tem `coverageThreshold` de 80% de branches em `pricing/` e `facade/`: o `npm run test:coverage` falha se a cobertura cair.
