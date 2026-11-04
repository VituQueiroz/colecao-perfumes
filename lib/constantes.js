export const OCASIOES = [
  'Dia a Dia', 'Profissional', 'Balada', 'Encontro',
  'Faculdade', 'Academia', 'Casamento', 'Happy Hour',
];

export const NOTAS_OLFATIVAS = [
  'Amadeirado', 'Cítrico', 'Doce', 'Fresco', 'Oriental',
  'Especiado', 'Aquático / Marinho', 'Aromático', 'Frutado', 'Herbal',
];

const CORES_OCASIAO = {
  'Dia a Dia': 'primary', Profissional: 'dark', Balada: 'purple',
  Encontro: 'red', Faculdade: 'green', Academia: 'orange',
  Casamento: 'yellow', 'Happy Hour': 'cyan',
};

const CORES_NOTA = {
  Amadeirado: 'brown', Cítrico: 'yellow', Doce: 'pink',
  Fresco: 'skyblue', Oriental: 'red', Especiado: 'orange',
  'Aquático / Marinho': 'cyan', Aromático: 'green',
  Frutado: 'purple', Herbal: 'darkgreen',
};

export const corOcasiao = (o) => CORES_OCASIAO[o] || 'secondary';
export const corNota = (n) => CORES_NOTA[n] || 'secondary';

export function reais(valor) {
  const n = parseFloat(valor);
  return 'R$ ' + (isNaN(n) ? 0 : n).toFixed(2).replace('.', ',');
}
