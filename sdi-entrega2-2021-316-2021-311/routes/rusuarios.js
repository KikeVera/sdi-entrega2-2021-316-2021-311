module.exports = function(app,swig,gestorBD) {


    app.get("/usuario/registrarse", function(req, res) {
        app.get("logger").info("Accediendo al formulario de registro");
        if(req.session.usuario !=null){
            app.get("logger").fatal("Error al acceder al registro");
            res.redirect("/ofertas/tienda");
        }else{
            let respuesta = swig.renderFile('views/bregistro.html', {});
            res.send(respuesta);
        }
    });

    app.post('/usuario/registrarse', function(req, res) {
        app.get("logger").info("Petición de registro");

        let mensajesError = [];
        if(req.body.email.trim()===''){
            mensajesError.push("Error,debe rellenar el campo de email");
            app.get("logger").error("Error, debe rellenar el campo de email");
        }
        if(req.body.name.trim()===''){
            mensajesError.push("Error, debe rellenar el campo de nombre");
            app.get("logger").error("Error, debe rellenar el campo de nombre");
        }
        if(req.body.surname.trim()===''){
            mensajesError.push("Error debe rellenar el campo de apellido");
            app.get("logger").error("Error debe rellenar el campo de apellido");
        }
        if(req.body.password.trim()===''){
            mensajesError.push("Error, debe rellenar el campo de contraseña");
            app.get("logger").error("Error, debe rellenar el campo de contraseña");
        }
        if(req.body.password!==req.body.confirmPassword){
            mensajesError.push("Las contraseñas no coinciden");
            app.get("logger").error("Las contraseñas no coinciden");
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
                        app.get("logger").fatal("Error al registrar usuario");
                        res.redirect("/usuario/registrarse?tipoMensaje=alert-danger&mensaje=Error al registrar usuario");
                    } else {
                        app.get("logger").info("Nuevo usuario registrado");
                        res.redirect("/usuario/identificarse?mensaje=Nuevo usuario registrado");
                    }
                });
            }else{
                app.get("logger").error("Ya existe un usuario con el email aportado");
                res.redirect("/usuario/registrarse?tipoMensaje=alert-danger&mensaje=Error, ya existe un usuario con el email aportado");
            }
        });
    });

    app.get("/usuario/identificarse", function(req, res) {
        app.get("logger").info("Accediendo al formulario de identificación");
        if(req.session.usuario !=null){
            res.redirect("/ofertas/tienda");
        }else{
            app.get("logger").fatal("Error accediendo al formulario de identificación");
            let respuesta = swig.renderFile('views/bidentificacion.html', {});
            res.send(respuesta);
        }
    });

    app.post("/usuario/identificarse", function(req, res) {
        app.get("logger").info("Petición de identificación");

        if(req.body.email.trim() === ""){
            app.get("logger").error("El campo email no puede estar vacío");
            res.redirect("/usuario/identificarse?tipoMensaje=alert-warning&mensaje=Rellene el campo email para continuar");

            return;
        }
        if(req.body.password.trim() === ""){
            app.get("logger").error("El campo password no puede estar vacío");
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
                app.get("logger").error("error");//corregir esta parte
                res.redirect("/usuario/identificarse?tipoMensaje=alert-danger&mensaje=Email o constraseña incorrecta");
            } else {

                req.session.usuario = usuarios[0];
                if(usuarios[0].rol === "admin"){
                    app.get("logger").info("Inicio de sesión como admin");
                    res.redirect('/admin/users');
                }else{
                    app.get("logger").info("Inicio de sesión como usuario");
                    res.redirect('/ofertas/tienda');
                }

            }
        });
    });

    app.get('/usuario/desconectarse', function (req, res) {
        app.get("logger").info("Usuario desconectandose");
        req.session.usuario = null;
        res.redirect('/usuario/identificarse');
    });
};