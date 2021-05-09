module.exports = function(app,swig,gestorBD) {


    app.get("/usuario/registrarse", function(req, res) {
        if(req.session.usuario !=null){
            res.redirect("/ofertas/tienda");
        }else{
            let respuesta = swig.renderFile('views/bregistro.html', {});
            res.send(respuesta);
        }
    });

    app.post('/usuario/registrarse', function(req, res) {

        let mensajesError = [];
        if(req.body.email.trim()===''){
            mensajesError.push("Error debe rellenar el campo de email");
        }
        if(req.body.name.trim()===''){
            mensajesError.push("Error debe rellenar el campo de nombre");
        }
        if(req.body.surname.trim()===''){
            mensajesError.push("Error debe rellenar el campo de apellido");
        }
        if(req.body.password.trim()===''){
            mensajesError.push("Error debe rellenar el campo de contraseña");
        }
        if(req.body.password!==req.body.confirmPassword){
            mensajesError.push("Las contraseñas no coinciden");
        }
        if(mensajesError.length>0){
            let respuesta = swig.renderFile('views/bregistro.html',
                {mensajesError : mensajesError});
            res.send(respuesta);
            return;
        }
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let usuario = {
            email : req.body.email,
            name : req.body.name,
            surname:req.body.surname,
            password : seguro,
            rol : "estandar",
            dinero : 100
        }
        let criterio =  { email: usuario.email};
        gestorBD.obtenerUsuarios(criterio,function (usuarios)
        {
            if (usuarios == null || usuarios.length === 0) {
                gestorBD.insertarUsuario(usuario, function (id) {
                    if (id == null) {
                        res.redirect("/usuario/registrarse?tipoMensaje=alert-danger&mensaje=Error al registrar usuario");
                    } else {
                        res.redirect("/usuario/identificarse?mensaje=Nuevo usuario registrado");
                    }
                });
            }else{
                res.redirect("/usuario/registrarse?tipoMensaje=alert-danger&mensaje=Error ya existe un usuario con el email aportado");
            }
        });
    });

    app.get("/usuario/identificarse", function(req, res) {
        if(req.session.usuario !=null){
            res.redirect("/ofertas/tienda");
        }else{
            let respuesta = swig.renderFile('views/bidentificacion.html', {});
            res.send(respuesta);
        }
    });

    app.post("/usuario/identificarse", function(req, res) {

        if(req.body.email.trim() === ""){
            res.redirect("/usuario/identificarse?tipoMensaje=alert-warning&mensaje=Rellene el campo email para continuar");
            return;
        }
        if(req.body.password.trim() === ""){
            res.redirect("/usuario/identificarse?tipoMensaje=alert-warning&mensaje=Rellene el campo password para continuar");
            return;
        }

        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                req.session.usuario = null;
                res.redirect("/usuario/identificarse?tipoMensaje=alert-danger&mensaje=Email o constraseña incorrecta");
            } else {

                req.session.usuario = usuarios[0];
                if(usuarios[0].rol === "admin"){
                    res.redirect('/admin/users');
                }else{
                    res.redirect('/ofertas/tienda');
                }

            }
        });
    });

    app.get('/usuario/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect('/usuario/identificarse');
    });
};