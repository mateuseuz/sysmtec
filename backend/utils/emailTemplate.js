const getEmailTemplate = ({ title, content, buttonLink, buttonText }) => {
  const primaryColor = '#032f7e';
  const fontFamily = 'Montserrat, Helvetica, Arial, sans-serif';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: ${fontFamily};">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <tr>
                <td align="center" style="background-color: ${primaryColor}; padding: 30px; color: #ffffff;">
                  <h1 style="margin: 0; font-family: ${fontFamily}; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">SYSMTEC</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px; color: #333333; line-height: 1.8; font-size: 16px; font-family: ${fontFamily};">
                  <h2 style="font-family: ${fontFamily};">${title}</h2>
                  ${content}
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${buttonLink}" style="background-color: ${primaryColor}; color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; font-family: ${fontFamily};">
                          ${buttonText}
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 20px; font-size: 12px; color: #777777; font-family: ${fontFamily};">
                  <p style="margin: 0;">Se você não solicitou esta ação, por favor, ignore este e-mail.</p>
                  <p style="margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} SYSMTEC. Todos os direitos reservados.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = getEmailTemplate;
