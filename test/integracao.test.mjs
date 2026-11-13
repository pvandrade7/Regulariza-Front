import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { request, listarObrigacoesEmpresa, atualizarObrigacaoEmpresa } from '../src/services/api.js';
import { normalizarObrigacao, obterDashboard, listarObrigacoes, listarDocumentos, criarDocumento } from '../src/services/dados.js';
import { statusDaObrigacao, contarPorStatus, proximosVencimentos, calcularResumo } from '../src/utils/prazos.js';
import { isValidCPF, isValidCNPJ } from '../src/utils/validators.js';
import { saveEmpresaId, getEmpresa, setEmpresaAtual } from '../src/utils/empresaStorage.js';
const originalFetch = globalThis.fetch;
const memory = new Map();
globalThis.sessionStorage = { getItem:k=>memory.get(k) || null, setItem:(k,v)=>memory.set(k,v), removeItem:k=>memory.delete(k) };
afterEach(()=>{ globalThis.fetch=originalFetch; memory.clear(); setEmpresaAtual(null); });
const hoje = new Date(2026,10,7);
test('status canônicos e desconhecidos são preservados',()=>{
  assert.equal(normalizarObrigacao({status:'Concluída'}).status,'concluida');
  assert.equal(normalizarObrigacao({status:'Em andamento'}).status,'em_andamento');
  assert.equal(normalizarObrigacao({status:'Novo status'}).status,'desconhecido');
  assert.equal(normalizarObrigacao({status:'Novo status'}).statusOriginal,'Novo status');
  assert.equal(normalizarObrigacao({status:'pendente'}).status,'desconhecido');
  assert.equal(statusDaObrigacao({status:'Novo status',vencimento:'2020-01-01'},hoje),'desconhecido');
  assert.equal(statusDaObrigacao({status:'concluida',vencimento:'2020-01-01'},hoje),'concluida');
});
test('dashboard contabiliza atrasadas, em andamento e desconhecidas sem atribuir pendência',()=>{
  const lista = [{status:'pendente',vencimento:'2026-11-06'}, {status:'pendente'}, {status:'em_andamento',vencimento:'2026-11-07'}, {status:'concluida'}, {status:'X'}];
  assert.deepEqual(contarPorStatus(lista,hoje),{total:5,pendentes:1,atrasadas:1,concluidas:1,emAndamento:1,desconhecidas:1});
  assert.equal(calcularResumo(lista,hoje).situacao.nivel,'neutro');
  assert.equal(proximosVencimentos(lista,hoje).length,1);
});
test('sem obrigações não inventa indicadores',()=>assert.equal(calcularResumo([],hoje).total,0));
test('CPF/CNPJ verificam dígitos',()=>{
  assert.equal(isValidCPF('529.982.247-25'),true); assert.equal(isValidCPF('52998224726'),false);
  assert.equal(isValidCNPJ('11.222.333/0001-81'),true); assert.equal(isValidCNPJ('11222333000182'),false);
});
test('GET e PATCH usam os caminhos reais sem Authorization fictício',async()=>{
  const calls=[]; globalThis.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify({obrigacoes:[]}),{status:200});};
  await listarObrigacoesEmpresa('empresa'); await atualizarObrigacaoEmpresa('empresa',3,'Concluída');
  assert.ok(calls[0].url.endsWith('/empresas/empresa/obrigacoes'));
  assert.ok(calls[1].url.endsWith('/empresas/empresa/obrigacoes/3/status'));
  assert.equal(calls[1].options.method,'PATCH'); assert.equal(calls[1].options.headers.Authorization,undefined);
  assert.deepEqual(JSON.parse(calls[1].options.body),{status:'Concluída'});
});
test('erros HTTP, JSON inválido e falha de rede aparecem ao usuário',async()=>{
  globalThis.fetch=async()=>new Response(JSON.stringify({erros:['CPF inválido']}),{status:400});
  await assert.rejects(request('/empresas'),/CPF inválido/);
  globalThis.fetch=async()=>new Response('<html>erro</html>',{status:200});
  await assert.rejects(request('/empresas'),/resposta inválida/);
  globalThis.fetch=async()=>{throw new Error('offline');};
  await assert.rejects(request('/empresas'),/conectar ao servidor/);
});
test('dashboard consome envelope real e não necessita endpoint próprio',async()=>{
  saveEmpresaId('empresa'); let path;
  globalThis.fetch=async(url)=>{path=url;return new Response(JSON.stringify({obrigacoes:[{id:1,status:'Concluída'}]}));};
  const result=await obterDashboard(); assert.equal(result.resumo.total,1);assert.equal(result.resumo.concluidas,1);
  assert.ok(path.endsWith('/empresas/empresa/obrigacoes'));
});
test('envelope inesperado é erro e não lista vazia',async()=>{
  saveEmpresaId('empresa');globalThis.fetch=async()=>new Response(JSON.stringify({dados:[]}));
  await assert.rejects(listarObrigacoes(),/Formato inválido/);
});
test('somente identificador fica na sessão; empresa é memória transitória',()=>{
  saveEmpresaId('empresa');setEmpresaAtual({id:'empresa',nome:'Teste'});
  assert.equal(memory.has('regulariza_empresa'),false); assert.equal(getEmpresa().nome,'Teste');
  saveEmpresaId(null);assert.equal(getEmpresa(),null);
});
test('documentos não persistem ficticiamente',async()=>{
  await assert.rejects(listarDocumentos(),/indisponíveis/);
  await assert.rejects(criarDocumento({nome:'Teste'}),/não implementado/);
});

test('autenticação usa endpoints reais e cookie com credentials include',async()=>{
  const { fazerLogin, criarUsuario, consultarSessao, fazerLogout, setCsrfToken } = await import('../src/services/api.js');
  const chamadas=[];
  globalThis.fetch=async(url,options)=>{chamadas.push({url,options});return new Response(JSON.stringify({usuario:{id:'usuario'}}));};
  await criarUsuario({nome:'Teste',email:'teste@example.com',senha:'senha-de-teste'});
  await fazerLogin({email:'teste@example.com',senha:'senha-de-teste'});
  await consultarSessao();setCsrfToken('csrf-somente-em-memoria');await fazerLogout();
  assert.deepEqual(chamadas.map(c=>new URL(c.url).pathname),['/auth/register','/auth/login','/auth/me','/auth/logout']);
  assert.ok(chamadas.every(c=>c.options.credentials==='include'));
  assert.equal(chamadas[3].options.headers['X-CSRF-Token'],'csrf-somente-em-memoria');
  assert.equal(memory.size,0);setCsrfToken(null);
});
test('401 em recurso privado sinaliza sessão expirada sem persistir token',async()=>{
  const { setCsrfToken }=await import('../src/services/api.js');
  const originalWindow=globalThis.window;let sinal;
  globalThis.window={dispatchEvent:e=>{sinal=e.type;}};
  try {
    setCsrfToken('temporario');
    globalThis.fetch=async()=>new Response(JSON.stringify({mensagem:'Sessão expirada'}),{status:401});
    await assert.rejects(request('/empresas'),/Sessão expirada/);assert.equal(sinal,'regulariza:unauthorized');
    let headers;globalThis.fetch=async(_url,options)=>{headers=options.headers;return new Response('{}');};
    await request('/empresas',{method:'POST',body:{}});assert.equal(headers['X-CSRF-Token'],undefined);
  } finally {globalThis.window=originalWindow;setCsrfToken(null);}
});

test('datas da API chegam à listagem e ao dashboard sem inventar vencimentos ausentes', async () => {
  const {formatarData, diasAte, textoPrazo}=await import('../src/utils/prazos.js');
  saveEmpresaId('empresa');
  globalThis.fetch=async()=>new Response(JSON.stringify({obrigacoes:[
    {id:1,status:'Em andamento',vencimento:'2099-12-13'},
    {id:2,status:'Pendente',vencimento:null},
    {id:3,status:'Concluída',vencimento:null}
  ]}));
  const lista=await listarObrigacoes();
  assert.equal(formatarData(lista[0].vencimento),'13/12/2099');
  assert.equal(lista[1].vencimento,null);
  assert.equal(textoPrazo(diasAte(lista[1].vencimento)),'Sem data');
  const painel=await obterDashboard();
  assert.deepEqual(painel.proximos.map(o=>o.id),[1]);
  assert.equal(painel.resumo.emAndamento,1);
  assert.equal(painel.resumo.concluidas,1);
  assert.match(painel.resumo.situacao.texto,/sem vencimento definido/);
});
