module.exports = function(app,swig,gestorBD) {

    //Se muestra la vista de la tienda
    app.get("/ofertas/tienda", function(req, res) {
        app.get("logger").info("Accediendo a la tienda");
        let criterio;
        //Si se busca por strings se añade al criterio sino se muestran solo las ofertas que no son del usuario
        if( req.query.busqueda != null ){
            criterio = { "titulo" : new RegExp(req.query.busqueda,'i'),
                        vendedor : {$ne: req.session.usuario.email}};
        }else{
            criterio = {vendedor : {$ne: req.session.usuario.email}};
        }
        let pg = parseInt(req.query.pg);
        if ( req.query.pg == null){
            pg = 1;
        }
        //Se busca segun un criterio y por pagina las ofertas que no son del usaurio.
        gestorBD.obtenerOfertasPg(criterio, pg , function(ofertas, total ) {
            if (ofertas == null) {
                app.get("logger").fatal("Error al listar");
                res.redirect("/ofertas/tienda?mensaje=Error al listar");
            } else {
                let ultimaPg = total/5;
                if (total % 5 > 0 ){ // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas = []; // paginas mostrar
                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }

                let respuesta = renderWithUsuerData('views/btienda.html',req.session,{
                    ofertas : ofertas,
                    paginas : paginas,
                    actual : pg,});
                res.send(respuesta);
            }
        });
    });

    //Muestra la vista para agregar una oferta
    app.get("/ofertas/agregar", function(req, res) {
        app.get("logger").info("Accediendo al formulario de agregar oferta");
        let respuesta = renderWithUsuerData('views/bagregar.html',req.session,{});
        res.send(respuesta);
    });
    app.post('/ofertas/agregar', function(req, res) {

        app.get("logger").info("Petición para agregar oferta");
        let mensajesError = [];
        //Se guarda un error si el campo esta vacio

        if(req.body.titulo.trim()===''){

            app.get("logger").error("El campo del titulo está vacío");
            mensajesError.push("Error debe rellenar el campo de titulo");
        }

        //Se guarda un error si el campo esta vacio
        if(req.body.detalles.trim()===''){
            app.get("logger").error("El campo de detalles está vacío");
            mensajesError.push("Error debe rellenar el campo de detalles");
        }
        //Se guarda un error si el precio es menor a cero
        if(req.body.precio<0){
            app.get("logger").error("El campo de precio está vacío");
            mensajesError.push("El precio no puede ser negativo");

        }


        //Si existen errores se devuelve a la vista los mensajes de error
        if(mensajesError.length>0){
            let respuesta = renderWithUsuerData('views/bagregar.html',req.session,{mensajesError : mensajesError});
            res.send(respuesta);
            return;
        }
        //Si la checkbox esta activa se le cambia el valor a destacada a true
        let checkOutstanding =req.body.checkboxOutstanding;
        let outstanding = false;
        if(Array.isArray(checkOutstanding)){
            outstanding = true;
        }
        else if(checkOutstanding!==undefined){
            outstanding = true;
        }

        let oferta = {
            vendedor:req.session.usuario.email,
            titulo : req.body.titulo,
            detalles : req.body.detalles,
            precio : req.body.precio,
            fecha: new Date(),
            comprada: null,
            destacada : outstanding,
        }

        // Inserta en la base de datos la oferta
        gestorBD.insertarOferta(oferta, function(id){
            if (id == null) {
                app.get("logger").fatal("Error al dar de alta oferta");
                res.redirect("/ofertas/agregar?tipoMensaje=alert-danger&mensaje=Error al dar de alta oferta");
            } else {
                if(outstanding && req.session.dinero < 20.0){
                    app.get("logger").error("Dinero insuficiente para destacar la oferta");
                    res.redirect("/ofertas/agregar?tipoMensaje=alert-warning&mensaje=No tiene suficiente dinero para destacar la oferta");
                }else if (outstanding){
                    //Si fue destacada se le cobra al usuario
                    cobrarDestacado(req,res,"");
                }else{
                    res.redirect('/ofertas/propias');
                }
            }
        });
    });

    //Cobrar al usuario 20 euros
    function cobrarDestacado(req,res,msg){
        req.session.usuario.dinero = req.session.usuario.dinero - 20.0;
        let dinero = {dinero : req.session.usuario.dinero};
        let criterioUsuario = {"email" : req.session.usuario.email};
        gestorBD.modificarUsuario(criterioUsuario,dinero ,function(id){
            if (id == null) {
                app.get("logger").fatal("Error al intentar actualizar usuario");
                req.session.usuario.dinero = req.session.usuario.dinero + 20.0;
                res.redirect("/ofertas/tienda?tipoMensaje=alert-danger&mensaje=Error al intentar actualizar usuario");
            } else {

                if(msg===""){
                    res.redirect('/ofertas/propias');
                }else{
                    res.redirect('/ofertas/propias?tipoMensaje=alert-warning&mensaje=' + msg);
                }
            }
        });
    }
    //Muestra la vista de ofertas propias con todas las ofertas del usaurio loggueado
    app.get("/ofertas/propias", function(req, res) {
        app.get("logger").info("Accediendo al listado de ofertas propias");
        let criterio = { vendedor : req.session.usuario.email };
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                app.get("logger").fatal("Error al obtener ofertas propias");
                res.redirect("/ofertas/agregar?tipoMensaje=alert-danger&mensaje=Error al obtener ofertas propias");
            } else {
                let respuesta = renderWithUsuerData('views/bofertaspropias.html',req.session,{ofertas: ofertas});
                res.send(respuesta);
            }
        });
    });

    //Elimina una oferta seleccionada si el usuasrio loggeado es el propietario
    app.get('/ofertas/eliminar/:id', function (req, res) {
        app.get("logger").info("Petición para eliminar oferta");
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };

        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                app.get("logger").fatal("Error al obtener oferta");
                res.redirect("/ofertas/propias?tipoMensaje=alert-danger&mensaje=Error al obtener oferta");
            } else {
                //Se compruenba que el usaurio que intenta borrar la oferta es el propietario
                if(ofertas[0].vendedor!==req.session.usuario.email){
                    app.get("logger").error("La oferta mo paertenece al usuario");
                    res.redirect("/ofertas/tienda?tipoMensaje=alert-danger&mensaje=La oferta no le pertenece");
                    return;
                }
                if(ofertas[0].comprada != null){
                    app.get("logger").error("La oferta ya ha sido comprada");
                    res.redirect("/ofertas/tienda?tipoMensaje=alert-danger&mensaje=La oferta ya ha sido comprada");
                    return;
                }

                //Se elimina la oferta
                gestorBD.eliminarOferta(criterio,function(ofertas){
                    if ( ofertas == null ){
                        app.get("logger").fatal("Error al borrar oferta");
                        res.redirect("/ofertas/propias?tipoMensaje=alert-danger&mensaje=Error al borrar oferta");
                    } else {
                        res.redirect("/ofertas/propias");
                    }
                });
            }
        });
    })

    //Se realiza la compra de una oferta
    app.get("/ofertas/comprar/:id", function(req, res) {
        app.get("logger").info("Petición para comprar oferta");
        //Compra que se va a realizar
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            //Si no exite esa oferta o el usuario que quiere comprarla es el vendedor se devuelve un error
            if (ofertas == null || ofertas[0].vendedor === req.session.usuario.email) {
                app.get("logger").fatal("Error al comprar la oferta");
                res.redirect("/ofertas/tienda?tipoMensaje=alert-danger&mensaje=Error al comprar la oferta");
            } else {
                let oferta = ofertas[0];
                //Si el dinero del usuario se es inferior al precio de la oferta se advierte al usuario
                if(oferta.precio > req.session.usuario.dinero){
                    app.get("logger").error("No tienes suficiente dinero para realizar la compra");
                    res.redirect("/ofertas/tienda?tipoMensaje=alert-warning&mensaje=No tienes suficiente dinero para realizar la compra");
                }else{
                    //Se añade al usuario como comprador de la oferta
                    oferta.comprada = req.session.usuario.email;
                    gestorBD.modificarOferta(criterio,oferta, function(id){
                        if (id == null) {
                            //Falla la compra del producto
                            app.get("logger").fatal("Error al comprar la oferta");
                            res.redirect("/ofertas/tienda?tipoMensaje=alert-danger&mensaje=Error al comprar la oferta");
                        } else {
                            //Se asigno la compra al usuario, pero se debe actualizar el saldo del usuario
                            let dinero = {
                                dinero : req.session.usuario.dinero - oferta.precio};
                            let criterioUsuario = {"email" : req.session.usuario.email};
                            //user.dinero = user.dinero-oferta.precio;
                            gestorBD.modificarUsuario(criterioUsuario,dinero ,function(id){
                                if (id == null) {
                                    //Si falla se borra al usuario como comprador de la oferta
                                    oferta.comprada = null;
                                    gestorBD.modificarOferta(criterio,oferta, function(id){
                                        if (id == null) {
                                            app.get("logger").fatal("Error fatidico al realizar la compra de la oferta");
                                            res.redirect("/ofertas/tienda?tipoMensaje=alert-danger&mensaje=Error fatidico al realizar la compra de la oferta, porfavor, contacte con nosotros");
                                        } else {
                                            res.redirect("/ofertas/tienda?tipoMensaje=alert-danger&mensaje=Error al realizar la compra");
                                        }
                                    });
                                } else {
                                    req.session.usuario.dinero = req.session.usuario.dinero - oferta.precio;
                                    res.redirect('/ofertas/tienda?mensaje=Compra realizada con exito');
                                }
                            });
                        }
                    });
                }
            }
        });
    });

    //Se muestra la vista de las ofertas compradas por el usuario loggeado
    app.get("/ofertas/compradas", function(req, res) {
        app.get("logger").info("Accediendo a las ofertas compradas");
        let criterio = { comprada : req.session.usuario.email };
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                app.get("logger").fatal("Error al obtener ofertas compradas");
                res.redirect("/ofertas/propias?tipoMensaje=alert-danger&mensaje=Error al obtener ofertas compradas");
            } else {
                let respuesta = renderWithUsuerData('views/bofertascompradas.html',req.session,{ofertas : ofertas});
                res.send(respuesta);
            }
        });
    });
    //Se destaca una oferta
    app.get("/ofertas/destacar/:id", function(req, res) {
        app.get("logger").info("Petición para destacar oferta");
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id),vendedor:req.session.usuario.email };
        //Se comprueba que el saldo del usuario es mayor a 20
        if(req.session.usuario.dinero<20.0){
            app.get("logger").error("Dinero insuficiente");
            res.redirect("/ofertas/propias?tipoMensaje=alert-warning&mensaje=No dispone de los 20€ para destacar la oferta");
            return;
        }
        //Se obtiene la oferta a modificar
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                app.get("logger").fatal("Error al obtener la oferta a destacar");
                res.redirect("/ofertas/propias?tipoMensaje=alert-danger&mensaje=Error al obtener la oferta a destacar");
            } else {
                let oferta = ofertas[0];
                oferta.destacada =true;
                //Se modifica la oferta
                gestorBD.modificarOferta(criterio,oferta, function(modificadas) {
                    if (modificadas == null) {
                        app.get("logger").fatal("Error al modificar la oferta a destacar");
                        res.redirect("/ofertas/propias?tipoMensaje=alert-danger&mensaje=Error al modificar la oferta a destacar");
                    } else {
                        cobrarDestacado(req,res,"Su oferta ha sido destacada");
                    }
                });
            }
        });
    });
    //Realiza un render con los datos del usuario y otros parametros
    function renderWithUsuerData(view,session,parametros){
        parametros.user = ({email: session.usuario.email,
                dinero: session.usuario.dinero,
                rol : session.usuario.rol});
        return swig.renderFile(view,parametros)
    }
};