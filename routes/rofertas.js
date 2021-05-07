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
                console.log(ofertas);
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


                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        ofertas : ofertas,
                        paginas : paginas,
                        actual : pg,
                        user : req.session.usuario,
                    });
                res.send(respuesta);
            }
        });
    });


    app.get("/ofertas/agregar", function(req, res) {
        let respuesta = swig.renderFile('views/bagregar.html', {
            user : req.session.usuario,
        });
        res.send(respuesta);
    });

    app.post('/ofertas/agregar', function(req, res) {
        console.log(req.body);
        if(req.body.titulo.trim()===''||req.body.detalles.trim()===''){
            res.redirect("/ofertas/agregar?mensaje=No puede haber campos vacíos");
        }
        if(req.body.precio<0){
            res.redirect("/ofertas/agregar?mensaje=El precio no puede ser negativo");
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
                res.redirect("/ofertas/agregar?mensaje=Error al dar de alta oferta");
            } else {
                if(outstanding && req.session.dinero < 20){
                    res.redirect("/ofertas/agregar?mensaje=No tiene suficiente dinero para destacar la oferta");
                }else{
                    cobrarDestacado(req,res,"");
                }
            }
        });
    });

    function cobrarDestacado(req,res,msg){
        let dinero = {
            dinero : req.session.usuario.dinero - 20};
        let criterioUsuario = {"email" : req.session.usuario.email};
        //user.dinero = user.dinero-oferta.precio;
        gestorBD.modificarUsuario(criterioUsuario,dinero ,function(id){
            if (id == null) {
                res.redirect("/ofertas/tienda?mensaje=Error al intentar actualizar usuario");
            } else {
                req.session.usuario.dinero = req.session.usuario.dinero - 20;
                if(msg=""){
                    res.redirect('/ofertas/propias');
                }else{
                    res.redirect('/ofertas/propias?mensaje=' + msg);
                }
            }
        });
    }

    app.get("/ofertas/propias", function(req, res) {
        let criterio = { vendedor : req.session.usuario.email };
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                res.redirect("/ofertas/agregar?mensaje=Error al obtener ofertas propias");
            } else {
                let respuesta = swig.renderFile('views/bofertaspropias.html',
                    {
                        ofertas : ofertas,
                        user : req.session.usuario
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/ofertas/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };

        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                res.redirect("/ofertas/propias?mensaje=Error al obtener oferta");
            } else {

                if(ofertas[0].vendedor!==req.session.usuario)
                    res.redirect("/ofertas/tienda?mensaje=La oferta no te pertenece");
                if(ofertas[0].comprada != null)
                    res.redirect("/ofertas/tienda?mensaje=La oferta ya ha sido comprada");

                gestorBD.eliminarOferta(criterio,function(ofertas){
                    if ( ofertas == null ){
                        res.redirect("/ofertas/propias?mensaje=Error al borrar oferta");
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
            if (ofertas == null || ofertas[0].vendedor == req.session.usuario.email) {
                res.redirect("/ofertas/tienda?mensaje=Error al comprar la oferta");
            } else {
                let oferta = ofertas[0];
                //Si el dinero del usuario se es inferior al precio de la oferta se advierte al usuario
                if(oferta.precio > req.session.usuario.dinero){
                    res.redirect("/ofertas/tienda?mensaje=No tienes suficiente dinero para realizar la compra");
                }else{
                    //Se añade al usuario como comprador de la oferta
                    oferta.comprada = req.session.usuario.email;
                    gestorBD.modificarOferta(criterio,oferta, function(id){
                        if (id == null) {
                            //Falla la compra del producto
                            res.redirect("/ofertas/tienda?mensaje=Error al comprar la oferta");
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
                                            res.redirect("/ofertas/tienda?mensaje=Error fatidico al realizar la compra de la oferta, porfavor, contacte con nosotros");
                                        } else {
                                            res.redirect("/ofertas/tienda?mensaje=Error al realizar la compra");
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
                res.redirect("/ofertas/tienda?mensaje=Error al obtener ofertas compradas");
            } else {
                let respuesta = swig.renderFile('views/bofertascompradas.html',
                    {
                        ofertas : ofertas,
                        user : req.session.usuario
                    });
                res.send(respuesta);
            }
        });
    });
    app.get("/ofertas/destacar/:id", function(req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        if(req.session.usuario.dinero<20){
            res.redirect("/ofertas/tienda?mensaje=No dispone de los 20€ para destacar la oferta");
        }
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                res.redirect("/ofertas/tienda?mensaje=Error al obtener la oferta a destacar");
            } else {
                let oferta = ofertas[0];
                oferta.destacada =true;
                gestorBD.modificarOferta(criterio,oferta, function(modificadas) {
                    if (modificadas == null) {
                        res.redirect("/ofertas/tienda?mensaje=Error al modificar la oferta a destacar");
                    } else {
                        cobrarDestacado(req,res,"Su oferta ha sido destacada");
                    }
                });
            }
        });
    });
};