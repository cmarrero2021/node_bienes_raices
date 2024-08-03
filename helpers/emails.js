import nodemailer from 'nodemailer'
const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const {email, nombre, token} = datos
    await transport.sendMail({
        from:'BienesRaices.com',
        to:email,
        subject: 'Confirma tu cuenta en BienesRaices.com',
        text:'Confirma tu cuenta en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>
            <p>Tu cuenta ya está lista, sólo debes confirmarla en el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:3000/auth/confirmar/${token}">Confirmar cuenta</a></p>
            <p>Si tú no creaste esta cuenta, ignora este mensaje</p>

        `
    });
}
const emailOlvidePassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const {email, nombre, token} = datos
    await transport.sendMail({
        from:'BienesRaices.com',
        to:email,
        subject: 'Restablecimiento de password en BienesRaices.com',
        text:'Restablecimiento de password en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, Hemos recibido una solicitud de reinicio de clave en BienesRaices.com.
            Si efectivamente fuiste tú quién realizó la solicitud, presiona el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:3000/auth/olvide-password/${token}">Reiniciar clave</a></p>
            <p>Si tú no realizaste esta solicitud, ignora este mensaje</p>

        `
    });
}
export {
    emailRegistro,
    emailOlvidePassword
}