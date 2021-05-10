module.exports = function(app,swig,gestorBD) {

    //Se muestra la vista del registro si el usuario no esta loggeado
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

    //Se realiza un registro
    app.post('/usuario/registrarse', function(req, res) {
        app.get("logger").info("Petición de registro");

        let mensajesError = [];
        //Se comprueba que los campos no esten vacios
        if(req.body.email.trim()===''){
            mensajesError.push("Error, debe rellenar el campo de email");
            app.get("logger").error("Error, debe rellenar el campo de email");
        }
        if(req.body.name.trim()===''){
            mensajesError.push("Error, debe rellenar el campo de nombre");
            app.get("logger").error("Error, debe rellenar el campo de nombre");
        }
        if(req.body.surname.trim()===''){
            mensajesError.push("Error, debe rellenar el campo de apellido");
            app.get("logger").error("Error, debe rellenar el campo de apellido");
        }
        if(req.body.password.trim()===''){
            mensajesError.push("Error, debe rellenar el campo de contraseña");
            app.get("logger").error("Error, debe rellenar el campo de contraseña");
        }
        //Se comprueba que el segundo password sea el mismo en los dos campos
        if(req.body.password!==req.body.confirmPassword){
            mensajesError.push("Las contraseñas no coinciden");
            app.get("logger").error("Las contraseñas no coinciden");
        }
        //Si existieron errores los muestra y no se realiza el registro
        if(mensajesError.length>0){
            let respuesta = swig.renderFile('views/bregistro.html',
                {mensajesError : mensajesError});
            res.send(respuesta);
            return;
        }
        //Se encripta la contraseña
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
        //Se comprueba que no exista un usaurio con el mismo email
        gestorBD.obtenerUsuarios(criterio,function (usuarios)
        {
            if (usuarios == null || usuarios.length === 0) {
                //Se realiza el regisrtro
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

    //Se muestra la vista de identificacion si el usuario no esta loggeado
    app.get("/usuario/identificarse", function(req, res) {
        app.get("logger").info("Accediendo al formulario de identificación");
        if(req.session.usuario !=null){
            res.redirect("/ofertas/tienda");
        }else{

            let respuesta = swig.renderFile('views/bidentificacion.html', {});
            res.send(respuesta);
        }
    });

    //Se realiza la indetificacion del usaurio
    app.post("/usuario/identificarse", function(req, res) {
        app.get("logger").info("Petición de identificación");

        //Se mira que no existan campos vacios
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
        //Se encripta la contraseña
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let criterio = {
            email : req.body.email,
            password : seguro
        }

        //Se busaca el usuario y se guarda en session
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                req.session.usuario = null;
                app.get("logger").error("error");//corregir esta parte
                res.redirect("/usuario/identificarse?tipoMensaje=alert-danger&mensaje=Email o constraseña incorrecta");
            } else {

                req.session.usuario = usuarios[0];
                //Si es administrador se redirige a la vista de admin sino a la de usaurios
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

    //Se desconecta el usuario loggeado
    app.get('/usuario/desconectarse', function (req, res) {
        app.get("logger").info("Usuario desconectandose");
        req.session.usuario = null;
        res.redirect('/usuario/identificarse');
    });
};