import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import db from './config/db.js';
const app = express();
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(csrf({cookie:true}));
app.set('view cache', false);
try {
    await db.authenticate();
    db.sync();
    console.log("Conexión establecida");
} catch (error) {
    console.log(error);
}
app.set('view engine','pug');
app.set('views','./views');
app.use(express.static('public'));
app.use('/auth',usuarioRoutes);

const port =3000;
app.listen(port, ()  => {
    console.log(`El servidor está funcionando en el puerto ${port}`)
});