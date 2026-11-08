import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarEmpresaForm, validarEmpresaForm, payloadEmpresa, tipoDoRegime } from '../src/utils/empresaForm.js';
import { salvarEmpresaComObrigacoes } from '../src/services/cadastroEmpresa.js';
import { getEmpresaId, getEmpresa, setEmpresaAtual } from '../src/utils/empresaStorage.js';
import { obterDashboard } from '../src/services/dados.js';
import { setCsrfToken } from '../src/services/api.js';

const regimes = [{id: 17, nome: 'Pessoa Física'}, {id: 42, nome: 'Pessoa Jurídica'}];
const form = { ...iniciarEmpresaForm(), nome: ' Negócio ', regimeJuridicoId: '42', cnpj: '11.222.333/0001-81', atividade: 'Serviços', municipio: 'Fortaleza', estado: 'CE', estabelecimentoFisico: 'nao' };
const originalFetch = globalThis.fetch;
const memory = new Map();
globalThis.sessionStorage = { getItem: k => memory.get(k) ?? null, setItem: (k,v) => memory.set(k,v), removeItem: k => memory.delete(k) };
afterEach(() => { globalThis.fetch = originalFetch; memory.clear(); setEmpresaAtual(null); setCsrfToken(null); });

test('PF/PJ usam IDs reais, validam documentos e enviam somente o documento correspondente', () => {
  for (const [regimeJuridicoId, cpf, cnpj, tipo] of [['17','529.982.247-25','11222333000181','PF'], ['42','52998224725','11.222.333/0001-81','PJ']]) {
    const dados = {...form, regimeJuridicoId, cpf, cnpj};
    assert.equal(tipoDoRegime(regimes, regimeJuridicoId), tipo);
    assert.deepEqual(validarEmpresaForm(dados, regimes), {});
    const payload = payloadEmpresa(dados, regimes);
    assert.equal(payload.regimeJuridicoId, Number(regimeJuridicoId));
    assert.equal(payload.cpf, tipo === 'PF' ? '52998224725' : null);
    assert.equal(payload.cnpj, tipo === 'PJ' ? '11222333000181' : null);
    assert.equal(payload.porte, null);
  }
  assert.ok(validarEmpresaForm({...form, cnpj:'11222333000182'}, regimes).cnpj);
  assert.ok(validarEmpresaForm({...form, regimeJuridicoId:'17', cpf:'52998224726'}, regimes).cpf);
  assert.ok(validarEmpresaForm({...form, regimeJuridicoId:'999'}, regimes).regimeJuridicoId);
});

test('funcionários rejeitam sinal, decimais e overflow, sem reinterpretar a entrada', () => {
  for (const funcionarios of ['-1', '1,5', '1.5', '+1', '1e2', '2147483648', '']) {
    assert.ok(validarEmpresaForm({...form, funcionarios}, regimes).funcionarios, funcionarios);
  }
  for (const funcionarios of ['0', '15', '2147483647']) assert.equal(validarEmpresaForm({...form, funcionarios}, regimes).funcionarios, undefined);
});

test('novo cadastro exige estabelecimento explícito; edição preserva true e false', () => {
  assert.equal(iniciarEmpresaForm().estabelecimentoFisico, '');
  assert.ok(validarEmpresaForm({...form, estabelecimentoFisico:''}, regimes).estabelecimentoFisico);
  for (const [valor, booleano] of [['sim',true],['nao',false]]) {
    assert.equal(payloadEmpresa({...form, estabelecimentoFisico:valor}, regimes).estabelecimentoFisico, booleano);
    assert.equal(iniciarEmpresaForm({estabelecimentoFisico:booleano}).estabelecimentoFisico, valor);
  }
});

test('cadastro sincroniza uma vez com cookie/CSRF antes de carregar dashboard atualizado', async () => {
  const calls=[]; let sincronizado=false;
  setCsrfToken('csrf-teste');
  globalThis.fetch=async(url,options)=>{
    calls.push({url,options});
    if(url.endsWith('/sincronizar')) {
      assert.equal(getEmpresaId(),'empresa');
      assert.match(JSON.parse(options.body).dataBase,/^\d{4}-\d{2}-\d{2}$/);
      sincronizado=true;
      return Response.json({mensagem:'Sincronização concluída.',vinculosCriados:1});
    }
    if(url.endsWith('/obrigacoes')) {
      assert.ok(sincronizado);
      return Response.json({obrigacoes:[{id:1,status:'Pendente'}]});
    }
    return Response.json({id:'empresa',...JSON.parse(options.body)});
  };
  const resultado=await salvarEmpresaComObrigacoes(payloadEmpresa(form,regimes),null);
  assert.ok(resultado.mensagem); assert.equal(resultado.avisoSincronizacao,undefined);
  assert.equal((await obterDashboard()).resumo.total,1);
  assert.equal(calls.filter(c=>c.url.endsWith('/sincronizar')).length,1);
  assert.ok(calls.every(c=>c.options.credentials==='include'));
  assert.ok(calls.filter(c=>c.options.method==='POST').every(c=>c.options.headers['X-CSRF-Token']==='csrf-teste'));
});

test('falha de sincronização preserva cadastro e seleção sem anunciar sucesso completo', async () => {
  const calls=[];
  globalThis.fetch=async(url)=>{
    calls.push(url);
    return url.endsWith('/sincronizar') ? Response.json({mensagem:'Indisponível'},{status:500}) : Response.json({id:'salva',nome:'Negócio'});
  };
  const resultado=await salvarEmpresaComObrigacoes(payloadEmpresa(form,regimes),null);
  assert.equal(resultado.mensagem,undefined);
  assert.match(resultado.avisoSincronizacao,/Empresa cadastrada.*não foi confirmada/);
  assert.equal(getEmpresaId(),'salva'); assert.equal(getEmpresa().nome,'Negócio');
  assert.equal(calls.length,2);
});

test('falha de cadastro não sincroniza; edição não dispara sincronização automática', async () => {
  let calls=0;
  globalThis.fetch=async()=>{ calls++; return Response.json({mensagem:'Inválido'},{status:400}); };
  await assert.rejects(salvarEmpresaComObrigacoes({},null),/Inválido/);
  assert.equal(calls,1); assert.equal(getEmpresaId(),null);
  globalThis.fetch=async(url,options)=>{
    assert.ok(url.endsWith('/existente')); assert.equal(options.method,'PATCH');
    return Response.json({id:'existente'});
  };
  assert.match((await salvarEmpresaComObrigacoes({},'existente')).mensagem,/Sincronize/);
});
