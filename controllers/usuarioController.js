import {check, validationResult} from 'express-validator';
// import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Usuario from '../models/usuario.js'
import {generarJWT,generarId} from '../helpers/tokens.js';
import {emailRegistro,emailOlvidePassword} from '../helpers/emails.js';
const formularioLogin = (req,res) => {
    res.render('auth/login', {
        pagina: 'Iniciar sesión' ,
        csrfToken: req.csrfToken()
    })    
}
const autenticar = async (req,res) => {
    await check('email').notEmpty().withMessage("El correo es requerido").run(req);
    await check('email').isEmail().withMessage("El correo debe tener un formato válido").run(req);
    await check('password').notEmpty().withMessage("El password es requerido").run(req);
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken:req.csrfToken(),
            errores:resultado.array()
        })          
    }
    const {email, password} = req.body;
    // console.log("body: ",req.body);
    // console.log("correo: ",email);
    // console.log("clave: ",password);
    const usuario = await Usuario.findOne({where: {email}});
    if (!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken:req.csrfToken(),
            errores:[{msg: 'El usuario no existe'}]
        })          
    }    
    if (!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken:req.csrfToken(),
            errores:[{msg: 'El usuario no ha verificado su cuenta'}]
        })          
    }
    if (!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken:req.csrfToken(),
            errores:[{msg: 'El password es incorrecto'}]
        })          
    }
    const token = generarJWT(usuario);
    console.log(token)
    return res.cookie('_token',token, {
        httpOnly:true,
        // secure:true //Solo para conexiones seguras https
        // sameSite:true //Solo para conexiones seguras https
    }).redirect('/mis-propiedades')


}
const formularioRegistro = (req,res) => {
    res.render('auth/registro', {
        pagina: 'Crear cuenta',
        csrfToken:req.csrfToken()
    })    
}
const registrar = async (req,res) => {
    await check('nombre').notEmpty().withMessage("El nombre es requerido").run(req);
    await check('email').notEmpty().withMessage("El correo es requerido").run(req);
    await check('email').isEmail().withMessage("El correo debe tener un formato válido").run(req);
    await check('password')
        .isLength({ min: 8 }).withMessage("El password debe tener al menos 8 caracteres")
        .matches(/[A-Z]/).withMessage("El password debe tener al menos una letra mayúscula")
        .matches(/[a-z]/).withMessage("El password debe tener al menos una letra minúscula")
        .matches(/[0-9]/).withMessage("El password debe tener al menos un número")
        .matches(/[#\$%@&\+\*\.\-_]/).withMessage("El password debe tener al menos uno de los siguientes caracteres especiales: #$@%&+*.-_")
        .run(req);
    await check('repetir_password')
        .custom((value, { req }) => value === req.body.password).withMessage("El password y su confirmación no coinciden")
        .run(req);    
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            csrfToken:req.csrfToken(),
            errores:resultado.array(),
            usuario: {
                nombre:req.body.nombre,
                email:req.body.email

            }
        })          
    }
    const {nombre,email,password}=req.body
    const existeUsuario = await Usuario.findOne({where: {email:req.body.email}});

    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            csrfToken:req.csrfToken(),
            errores:[{msg: "El correo electrónico ya está registrado"}],
            usuario: {
                nombre:req.body.nombre,
                email:req.body.email

            }
        })          
    }

    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token:generarId()
    })
    emailRegistro({
        nombre:usuario.nombre,
        email:usuario.email,
        token: usuario.token
    })
    return res.render('auth/registro', {
        pagina: 'Crear cuenta',
        nuevo: {
            nombre:req.body.nombre,
            email:req.body.email

        }
    })  
    return;
}

const confirmar = async (req,res) => {
    const {token} = req.params;
    const usuario = await Usuario.findOne({where:{token}});
    if (!usuario) {
        return res.render('auth/confirmar_cuenta', {
            pagina: 'Token inválido',
            mensaje: 'El token no existe, ha expirado o ya ha sido utilizado; intente de nuevo o solicite un nuevo correo de confirmación',
            error: true
        });
    } else {
        usuario.token=null;
        usuario.confirmado=true;
        await usuario.save();
        return res.render('auth/confirmar_cuenta', {
            pagina: 'Cuenta validada exitosamente',
            mensaje: 'La cuenta ha sido validada de manera exitosa',
            error: false
        });
    }
    
}
const formularioOlvidePassword = (req,res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recuperar Clave',
        csrfToken:req.csrfToken()
    })    
}
const resetPassword = async (req, res) => {
    await check('email').notEmpty().withMessage("El correo es requerido").run(req);
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        return res.render('auth/olvide-password', {
            pagina: 'Reiniciar clave',
            csrfToken:req.csrfToken(),
            errores:resultado.array()
        })          
    }
    const {email} =req.body;
    const usuario = await Usuario.findOne({where: {email}});
    if (!usuario) {
        return res.render('auth/olvide-password', {
            pagina: "Reinicio e clave",
            csrfToken: req.csrfToken(),
            errores: [{msg:"Correo no registrado"}]
        })
    }
    usuario.token = generarId();
    await usuario.save();
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    });
    res.render('templates/mensaje',{
        pagina: 'Reiniciar clave',
        mensaje: `Se ha  enviado un correo a la diección ${usuario.email} para reiniciar la clave`
    })
}
const comprobarToken = async (req,res) => {
    console.log("pepe");
    const {token} = req.params;
    const usuario = await Usuario.findOne({where:{token}});
    if (!usuario) {
        return res.render('auth/confirmar_cuenta', {
            pagina: 'Reestablece tu password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        });
    }
    res.render('auth/reset-password',{
        pagina: "Restablece tu password",
        csrfToken: req.csrfToken()

    });
}
const nuevoPassword = async (req,res) => {
    await check('password')
        .isLength({ min: 8 }).withMessage("El password debe tener al menos 8 caracteres")
        .matches(/[A-Z]/).withMessage("El password debe tener al menos una letra mayúscula")
        .matches(/[a-z]/).withMessage("El password debe tener al menos una letra minúscula")
        .matches(/[0-9]/).withMessage("El password debe tener al menos un número")
        .matches(/[#\$%@&\+\*\.\-_]/).withMessage("El password debe tener al menos uno de los siguientes caracteres especiales: #$@%&+*.-_")
        .run(req);
    await check('repetir_password')
        .custom((value, { req }) => value === req.body.password).withMessage("El password y su confirmación no coinciden")
        .run(req);    
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        return res.render('auth/reset-password', {
            pagina: 'Restablece tu password',
            csrfToken:req.csrfToken(),
            errores:resultado.array(),
        })          
    }
    const  {token} = req.params;
    const  {password} = req.body;
    const usuario = await Usuario.findOne({where:{token}});
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password,salt);
    usuario.token = null;
    usuario.save();
    res.render('auth/confirmar_cuenta', {
        pagina: "Password restablecido",
        mensaje: 'El password fue restablecido adecuadamente'
    })

}
export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}