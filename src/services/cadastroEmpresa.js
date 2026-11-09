import { salvarEmpresa, sincronizarObrigacoes } from './api.js';
import { saveEmpresaId, setEmpresaAtual } from '../utils/empresaStorage.js';
import { dataParaISO } from '../utils/prazos.js';

export async function salvarEmpresaComObrigacoes(dados, id) {
  const empresa = await salvarEmpresa(dados, id);
  // A criação já foi confirmada: uma falha posterior não deve reenviar o POST.
  saveEmpresaId(empresa.id);
  setEmpresaAtual(empresa);
  if (id) return { mensagem: 'Empresa salva. Sincronize as obrigações na Central após alterar o perfil.' };
  try {
    const resultado = await sincronizarObrigacoes(empresa.id, dataParaISO());
    return { mensagem: `Empresa cadastrada. ${resultado.mensagem} ${resultado.vinculosCriados} vínculo(s) criado(s).` };
  } catch (err) {
    return { avisoSincronizacao: `Empresa cadastrada, mas a sincronização das obrigações não foi confirmada: ${err.message} Tente novamente na Central de Obrigações.` };
  }
}
