module.exports = function(app,swig,gestorBD) {


    app.get("/usuario/registrarse", function(req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.post('/usuario/registrarse', function(req, res) {


        if(req.body.email.trim()===''||req.body.name.trim()===''||req.body.surname.trim()===''||req.body.password.trim()===''){
            res.redirect("/usuario/registrarse?mensaje=No puede haber campos vacíos");
        }

        if(req.body.password!==req.body.confirmPassword){
            res.redirect("/usuario/registrarse?mensaje=Las contraseñas no coinciden ");
        }

        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let usuario = {
            email : req.body.email,
            name : req.body.name,
            surname:req.body.surname,
            password : seguro,
            rol : "estandar"
        }

        gestorBD.insertarUsuario(usuario, function(id) {
            if (id == null){
                res.redirect("/usuario/registrarse?mensaje=Error al registrar usuario");
            } else {
                console.log("aqui")
                res.redirect("/usuario/identificarse?mensaje=Nuevo usuario registrado");
                console.log("aqui2")
            }
        });
    });

    app.get("/usuario/identificarse", function(req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.post("/usuario/identificarse", function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/usuario/registrarse?mensaje=Email o constraseña incorrecta");
            } else {

                req.session.usuario = usuarios[0].email;
                console.log(req.session.usuario);
                res.redirect('/ofertas/tienda');
            }
        });
    });




};