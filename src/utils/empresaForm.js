import { isRequired, isValidCPF, isValidCNPJ, isPositiveInteger, onlyDigits } from './validators.js';

export function iniciarEmpresaForm(empresa) {
  return {
    nome: '', cpf: '', cnpj: '', regimeJuridicoId: '', atividade: '', porte: '', municipio: '', estado: '',
    ...empresa,
    funcionarios: String(empresa?.numeroFuncionarios ?? 0),
    estabelecimentoFisico: empresa ? (empresa.estabelecimentoFisico ? 'sim' : 'nao') : '',
  };
}

export function tipoDoRegime(regimes, id) {
  const nome = regimes.find(regime => String(regime.id) === String(id))?.nome;
  return nome === 'Pessoa Física' ? 'PF' : nome === 'Pessoa Jurídica' ? 'PJ' : null;
}

export function validarEmpresaForm(form, regimes) {
  const errors = {};
  const tipo = tipoDoRegime(regimes, form.regimeJuridicoId);
  if (!isRequired(form.nome)) errors.nome = 'Informe o nome da empresa.';
  if (!tipo) errors.regimeJuridicoId = 'Selecione o tipo de pessoa.';
  if (tipo === 'PF' && !isValidCPF(form.cpf || '')) errors.cpf = 'Informe um CPF válido.';
  if (tipo === 'PJ' && !isValidCNPJ(form.cnpj || '')) errors.cnpj = 'Informe um CNPJ válido.';
  if (!isRequired(form.atividade)) errors.atividade = 'Selecione a atividade.';
  if (!isRequired(form.municipio)) errors.municipio = 'Informe o município.';
  if (!isRequired(form.estado)) errors.estado = 'Selecione o estado.';
  if (!isPositiveInteger(form.funcionarios)) errors.funcionarios = 'Informe um inteiro entre 0 e 2147483647, sem sinal ou decimais.';
  if (!['sim', 'nao'].includes(form.estabelecimentoFisico)) errors.estabelecimentoFisico = 'Informe se a empresa possui estabelecimento físico.';
  return errors;
}

export function payloadEmpresa(form, regimes) {
  const tipo = tipoDoRegime(regimes, form.regimeJuridicoId);
  return {
    nome: form.nome.trim(),
    cpf: tipo === 'PF' ? onlyDigits(form.cpf) : null,
    cnpj: tipo === 'PJ' ? onlyDigits(form.cnpj) : null,
    regimeJuridicoId: Number(form.regimeJuridicoId), atividade: form.atividade,
    porte: form.porte || null, municipio: form.municipio.trim(), estado: form.estado,
    numeroFuncionarios: Number(form.funcionarios),
    estabelecimentoFisico: form.estabelecimentoFisico === 'sim',
  };
}
