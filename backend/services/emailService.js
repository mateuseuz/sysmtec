const nodemailer = require('nodemailer');

// Cria um transportador de e-mail real usando variáveis de ambiente.
const createRealTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_PORT === '465', // Geralmente true para a porta 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Configura um transportador de teste do Ethereal para desenvolvimento.
const setupTestTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  console.log('Conta de teste Ethereal criada (use para desenvolvimento se as credenciais de e-mail não estiverem definidas):');
  console.log(`Usuário: ${testAccount.user}`);
  console.log(`Senha: ${testAccount.pass}`);
  console.log('------------------------------------');

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

let transporter;

// Inicializa o transportador: usa o real se as variáveis de ambiente estiverem definidas, senão, usa o de teste.
(async () => {
  try {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = createRealTransporter();
      console.log('Transportador de e-mail real configurado.');
    } else {
      transporter = await setupTestTransporter();
      console.log('Variáveis de ambiente de e-mail não encontradas. Usando transportador de teste Ethereal.');
    }
  } catch (error) {
    console.error("Falha ao inicializar o transportador de e-mail:", error);
  }
})();

/**
 * Envia um e-mail.
 * @param {object} mailOptions - Opções do e-mail { to, subject, text, html }.
 * @returns {Promise<string|null>} A URL de visualização se usar Ethereal, ou null se usar o transportador real.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    throw new Error('O transportador de e-mail não está inicializado.');
  }

  try {
    const info = await transporter.sendMail({
      from: `"SYSMTEC" <${process.env.EMAIL_FROM || 'no-reply@sysmtec.com'}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`Mensagem enviada: ${info.messageId}`);

    // Se estivermos usando Ethereal, loga a URL de visualização.
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`URL de visualização (Ethereal): ${previewUrl}`);
      return previewUrl;
    }

    return null; // Retorna null quando um e-mail real é enviado.

  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw new Error('Falha ao enviar o e-mail.');
  }
};

module.exports = { sendEmail };
