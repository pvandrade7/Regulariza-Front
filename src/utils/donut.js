// Cálculo do gráfico em anel (donut) do Dashboard: divide o anel entre
// concluídas, pendentes e atrasadas. Fica fora da tela para poder ser testado.

function partes(resumo) {
  return [
    { chave: "concluidas", valor: Number(resumo.concluidas) || 0 },
    { chave: "pendentes", valor: Number(resumo.pendentes) || 0 },
    { chave: "atrasadas", valor: Number(resumo.atrasadas) || 0 },
  ];
}

// Base do cálculo: o total informado ou a soma das partes, o que for maior
// (assim o anel nunca passa de 100% se o back mandar números que não fecham).
function base(resumo) {
  const soma = partes(resumo).reduce((acc, p) => acc + p.valor, 0);
  return Math.max(Number(resumo.total) || 0, soma);
}

// Cada segmento: { chave, valor, comprimento, inicio }, medidos em unidades da circunferência.
export function segmentosDoDonut(resumo, circunferencia) {
  const total = base(resumo);
  if (total <= 0) return [];
  let acumulado = 0;
  return partes(resumo)
    .filter((p) => p.valor > 0)
    .map((p) => {
      const comprimento = (p.valor / total) * circunferencia;
      const segmento = { ...p, comprimento, inicio: acumulado };
      acumulado += comprimento;
      return segmento;
    });
}

// Percentual de obrigações concluídas (0 a 100), ou null se não há obrigações.
export function percentualConcluido(resumo) {
  const total = base(resumo);
  if (total <= 0) return null;
  return Math.round(((Number(resumo.concluidas) || 0) / total) * 100);
}