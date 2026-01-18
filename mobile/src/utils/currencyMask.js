/**
 * Funções para máscara de moeda (Real Brasileiro)
 */

/**
 * Aplica máscara de moeda ao valor digitado
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado como R$ 0,00
 */
export function formatCurrency(value) {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Se não houver números, retorna vazio
  if (!numbers) return '';
  
  // Converte para número e divide por 100 para ter centavos
  const amount = parseFloat(numbers) / 100;
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Remove a máscara e retorna apenas números
 * @param {string} value - Valor formatado
 * @returns {string} - Apenas números
 */
export function unmaskCurrency(value) {
  return value.replace(/\D/g, '');
}

/**
 * Converte valor formatado para número decimal
 * @param {string} value - Valor formatado (ex: "R$ 50,00")
 * @returns {number} - Valor numérico (ex: 50.00)
 */
export function currencyToNumber(value) {
  const numbers = unmaskCurrency(value);
  return parseFloat(numbers) / 100;
}

/**
 * Converte número para formato de moeda
 * @param {number} value - Valor numérico (ex: 50.00)
 * @returns {string} - Valor formatado (ex: "R$ 50,00")
 */
export function numberToCurrency(value) {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

