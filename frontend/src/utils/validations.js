export const validarCPF = (cpf) => {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  // Cálculo do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
  
  // Cálculo do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
  
  return (
    digitoVerificador1 === parseInt(cpf.charAt(9)) &&
    digitoVerificador2 === parseInt(cpf.charAt(10))
  );
};

export const validarCNPJ = (cnpj) => { 
  if (typeof cnpj !== 'string') cnpj = String(cnpj); 
  
  cnpj = cnpj.replace(/\D/g, ''); 

  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  let numerosParaDV1 = cnpj.substring(0, 12);
  let somaDV1 = 0;
  let pesoDV1 = 5;
  for (let i = 0; i < 12; i++) {
    somaDV1 += parseInt(numerosParaDV1.charAt(i)) * pesoDV1;
    pesoDV1--;
    if (pesoDV1 < 2) {
      pesoDV1 = 9;
    }
  }
  let dv1Calculado = somaDV1 % 11 < 2 ? 0 : 11 - (somaDV1 % 11);

  if (dv1Calculado !== parseInt(cnpj.charAt(12))) {
    return false;
  }

  let numerosParaDV2 = cnpj.substring(0, 13); 
  let somaDV2 = 0;
  let pesoDV2 = 6; 
  for (let i = 0; i < 13; i++) {
    somaDV2 += parseInt(numerosParaDV2.charAt(i)) * pesoDV2;
    pesoDV2--;
    if (pesoDV2 < 2) {
      pesoDV2 = 9;
    }
  }
  let dv2Calculado = somaDV2 % 11 < 2 ? 0 : 11 - (somaDV2 % 11);

  if (dv2Calculado !== parseInt(cnpj.charAt(13))) {
    return false;
  }

  return true;
};

export const validarCPFCNPJ = (doc) => {
  const docLimpo = doc.replace(/\D/g, '');

  if (docLimpo.length === 11) {
    if (!validarCPF(docLimpo)) {
      throw new Error('CPF inválido');
    }
  } else if (docLimpo.length === 14) {
    if (!validarCNPJ(docLimpo)) { 
      throw new Error('CNPJ inválido');
    }
  } else {
    throw new Error('Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos');
  }

  return true;
};

export const validarCelular = (celular) => {
  if (!celular || celular.trim() === '') {
    throw new Error('Celular é obrigatório');
  }

  const nums = celular.replace(/\D/g, '');
  if (nums.length < 10 || nums.length > 11) {
    throw new Error('Celular deve ter 10 ou 11 dígitos (após DDD)');
  }
  return true;
};

export const formatCPForCNPJ = (cpfCnpj) => {
  if (!cpfCnpj) return '';
  const str = cpfCnpj.toString().replace(/\D/g, '');
  
  if (str.length === 11) {
    return str.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (str.length === 14) {
    return str.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return str;
};

export const formatCelular = (celular) => {
  if (!celular) return '';
  const nums = celular.toString().replace(/\D/g, '');
  return nums.length === 11 ? 
    nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') :
    nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};