const nodemailer = require('nodemailer');

// Este serviço configura e usa uma conta de teste do Ethereal.
// Em um ambiente de produção, você substituiria isso por credenciais SMTP reais.
const setupTestTransporter = async () => {
  // Gera uma conta de serviço SMTP de teste do ethereal.email
  let testAccount = await nodemailer.createTestAccount();

  console.log('Conta de teste Ethereal criada:');
  console.log(`Usuário: ${testAccount.user}`);
  console.log(`Senha: ${testAccount.pass}`);
  console.log('------------------------------------');

  // Cria um objeto de transporte reutilizável usando o transporte SMTP padrão
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: testAccount.user, // usuário etéreo gerado
      pass: testAccount.pass, // senha etérea gerada
    },
  });

  return transporter;
};

let transporter;

// Inicializa o transportador quando o módulo é carregado
(async () => {
    try {
        transporter = await setupTestTransporter();
    } catch (error) {
        console.error("Falha ao criar o transportador de e-mail:", error);
    }
})();

/**
 * Envia um e-mail.
 * @param {string} to - O endereço de e-mail do destinatário.
 * @param {string} subject - O assunto do e-mail.
 * @param {string} text - O corpo de texto simples do e-mail.
 * @param {string} html - O corpo HTML do e-mail.
 * @returns {Promise<string>} A URL da mensagem de visualização no Ethereal.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    throw new Error('O transportador de e-mail não foi inicializado.');
  }

  try {
    const info = await transporter.sendMail({
      from: '"SysMTEC" <no-reply@sysmtec.com>', // endereço do remetente
      to, // lista de destinatários
      subject, // linha de assunto
      text, // corpo de texto simples
      html, // corpo html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`Mensagem enviada: ${info.messageId}`);
    console.log(`URL de visualização: ${previewUrl}`); // URL para ver o e-mail no Ethereal
    
    return previewUrl;

  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw new Error('Falha ao enviar o e-mail.');
  }
};

module.exports = { sendEmail };
