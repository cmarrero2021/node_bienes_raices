const admin = (req,res) => {
    res.render('./propiesdades/admin',{
        pagina:'Mis Propiedades',
        barra: true
    })
}
const crear = (req,res) => {
    res.render('./propiesdades/crear',{
        pagina:'Crear Propiedades',
        barra: true
    })
}
export {
    admin,
    crear
}