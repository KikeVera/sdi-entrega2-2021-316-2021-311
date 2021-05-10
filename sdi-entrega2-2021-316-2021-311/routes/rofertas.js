module.exports = function(app,swig,gestorBD) {

    app.get("/ofertas/tienda", function(req, res) {
        let criterio = {};
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
        gestorBD.obtenerOfertasPg(criterio, pg , function(ofertas, total ) {
            if (ofertas == null) {
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
                let destacadas = [];
                let noDestacasdas = [];
                if(Array.isArray(ofertas)){
                    for(let i=0;i<ofertas.length;i++) {
                        if(ofertas[i].destacada){
                            destacadas.push(ofertas[i]);
                        }else{
                            noDestacasdas.push(ofertas[i]);
                        }
                    }
                }
                ofertas = destacadas;
                for(let i=0;i<noDestacasdas.length;i++) {
                    ofertas.push(noDestacasdas[i]);
                }

                let respuesta = renderWithUsuerData('views/btienda.html',req.session,{
                    ofertas : ofertas,
                    paginas : paginas,
                    actual : pg,});
                res.send(respuesta);
            }
        });
    });


    app.get("/ofertas/agregar", function(req, res) {
        let respuesta = renderWithUsuerData('views/bagregar.html',req.session,{});
        res.send(respuesta);
    });
    app.post('/ofertas/agregar', function(req, res) {
        let mensajesError = [];
        if(req.body.titulo.trim()===''){
            mensajesError.push("Error debe rellenar el campo de titulo");
        }
        if(req.body.detalles.trim()===''){
            mensajesError.push("Error debe rellenar el campo de detalles");
        }
        if(req.body.precio<0){
            mensajesError.push("El precio no puede ser negativo");

        }
        if(mensajesError.length>0){
            let respuesta = renderWithUsuerData('views/bagregar.html',req.session,{mensajesError : mensajesError});
            res.send(respuesta);
            return;
        }
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

        // Conectarse
        gestorBD.insertarOferta(oferta, function(id){
            if (id == null) {
                res.redirect("/ofertas/agregar?tipoMensaje=alert-danger&mensaje=Error al dar de alta oferta");
            } else {
                if(outstanding && req.session.dinero < 20.0){
                    res.redirect("/ofertas/agregar?tipoMensaje=alert-warning&mensaje=No tiene suficiente dinero para destacar la oferta");
                }else if (outstanding){
                    cobrarDestacado(req,res,"");
                }else{
                    res.redirect('/ofertas/propias');
                }
            }
        });
    });

    function cobrarDestacado(req,res,msg){
        req.session.usuario.dinero = req.session.usuario.dinero - 20.0;
        let dinero = {dinero : req.session.usuario.dinero};
        let criterioUsuario = {"email" : req.session.usuario.email};
        //user.dinero = user.dinero-oferta.precio;
        gestorBD.modificarUsuario(criterioUsuario,dinero ,function(id){
            if (id == null) {
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

    app.get("/ofertas/propias", function(req, res) {
        let criterio = { vendedor : req.session.usuario.email };
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                res.redirect("/ofertas/agregar?tipoMensaje=alert-danger&mensaje=Error al obtener ofertas propias");
            } else {
                let respuesta = renderWithUsuerData('views/bofertaspropias.html',req.session,{ofertas: ofertas});
                res.send(respuesta);
            }
        });
    });

    app.get('/ofertas/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };

        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                res.redirect("/ofertas/propias?tipoMensaje=alert-danger&mensaje=Error al obtener oferta");
            } else {

                if(ofertas[0].vendedor!==req.session.usuario.email){
                    res.redirect("/ofertas/tienda?tipoMensaje=alert-danger&mensaje=La oferta no le pertenece");
                    return;
                }
                if(ofertas[0].comprada != null){
                    res.redirect("/ofertas/tienda?tipoMensaje=alert-danger&mensaje=La oferta ya ha sido comprada");
                    return;
                }


                gestorBD.eliminarOferta(criterio,function(ofertas){
                    if ( ofertas == null ){
                        res.redirect("/ofertas/propias?tipoMensaje=alert-danger&mensaje=Error al borrar oferta");
                    } else {
                        res.redirect("/ofertas/propias");
                    }
                });
            }
        });
    })

    app.get("/ofertas/comprar/:id", function(req, res) {
        //Compra que se va a realizar
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            //Si no exite esa oferta o el usuario que quiere comprarla es el vendedor se devuelve un error
            if (ofertas == null || ofertas[0].vendedor === req.session.usuario.email) {
                res.redirect("/ofertas/tienda?tipoMensaje=alert-danger&mensaje=Error al comprar la oferta");
            } else {
                let oferta = ofertas[0];
                //Si el dinero del usuario se es inferior al precio de la oferta se advierte al usuario
                if(oferta.precio > req.session.usuario.dinero){
                    res.redirect("/ofertas/tienda?tipoMensaje=alert-warning&mensaje=No tienes suficiente dinero para realizar la compra");
                }else{
                    //Se añade al usuario como comprador de la oferta
                    oferta.comprada = req.session.usuario.email;
                    gestorBD.modificarOferta(criterio,oferta, function(id){
                        if (id == null) {
                            //Falla la compra del producto
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

    app.get("/ofertas/compradas", function(req, res) {
        let criterio = { comprada : req.session.usuario.email };
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                res.redirect("/ofertas/propias?tipoMensaje=alert-danger&mensaje=Error al obtener ofertas compradas");
            } else {
                let respuesta = renderWithUsuerData('views/bofertascompradas.html',req.session,{ofertas : ofertas});
                res.send(respuesta);
            }
        });
    });
    app.get("/ofertas/destacar/:id", function(req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id),vendedor:req.session.usuario.email };
        if(req.session.usuario.dinero<20.0){
            res.redirect("/ofertas/propias?tipoMensaje=alert-warning&mensaje=No dispone de los 20€ para destacar la oferta");
            return;
        }
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                res.redirect("/ofertas/propias?tipoMensaje=alert-danger&mensaje=Error al obtener la oferta a destacar");
            } else {
                let oferta = ofertas[0];
                oferta.destacada =true;
                gestorBD.modificarOferta(criterio,oferta, function(modificadas) {
                    if (modificadas == null) {
                        res.redirect("/ofertas/propias?tipoMensaje=alert-danger&mensaje=Error al modificar la oferta a destacar");
                    } else {
                        cobrarDestacado(req,res,"Su oferta ha sido destacada");
                    }
                });
            }
        });
    });

    function renderWithUsuerData(view,session,parametros){
        parametros.user = ({email: session.usuario.email,
                dinero: session.usuario.dinero,
                rol : session.usuario.rol});
        return swig.renderFile(view,parametros)
    }

    // app.get("/*", function(req, res) {
    //     //res.redirect("/ofertas/tienda");
    // });
};