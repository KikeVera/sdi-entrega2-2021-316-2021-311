module.exports = function(app, gestorBD) {



    app.post("/api/autenticar", function(req, res) {

        let seguro=app.get("crypto").createHmac('sha256', app.get('clave')).update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        }


        gestorBD.obtenerUsuarios(criterio, function(usuarios){
            if (usuarios == null || usuarios.length===0) {
                res.status(400);
                res.json({
                   autenticado : false
                })
            } else {
                let token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token : token
                });
            }
        });

    });


    app.get("/api/ofertas", function(req, res) {
        console.log(app.get("jwt").verify(req.headers.token, 'secreto').usuario)

        let criterio = {
            vendedor:{ $ne:app.get("jwt").verify(req.headers.token, 'secreto').usuario}
        };


        gestorBD.obtenerOfertas(criterio,function(ofertas){
            if ( ofertas == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(ofertas));
            }
        });
    });



    app.post("/api/mensajes/enviar/:id/:idConversacion?", function(req, res) {

        let criterioOferta = {"_id": gestorBD.mongo.ObjectID(req.params.id)};



            gestorBD.obtenerOfertas(criterioOferta,function(ofertas){
                if ( ofertas == null ){
                    res.status(500);
                    res.json({
                        error : "se ha producido un error"
                    })
                } else {
                    if(ofertas.length===0){
                        res.status(200);
                        res.json({
                            error: "No existen ofertas con este id"
                        })
                    }
                    else if (req.params.idConversacion === undefined) {
                        if (ofertas[0].vendedor === app.get("jwt").verify(req.headers.token, 'secreto').usuario) {

                            res.status(200);
                            res.json({
                                error: "No se puede iniciar una conversación en tu propia oferta"
                            })
                        } else {
                            let conversacion = {
                                idOferta: gestorBD.mongo.ObjectID(req.params.id),
                                emailInteresado: app.get("jwt").verify(req.headers.token, 'secreto').usuario,
                                emailPropietario: ofertas[0].vendedor,

                            }
                            gestorBD.insertarConversacion(conversacion, function (id) {
                                if (id == null) {
                                    res.status(500);
                                    res.json({
                                        error: "se ha producido un error",

                                    })
                                } else {
                                    let mensaje = {
                                        idConversacion: id,
                                        autor: app.get("jwt").verify(req.headers.token, 'secreto').usuario,
                                        texto: req.body.texto,
                                        fecha: new Date(),
                                        leido: false
                                    }
                                    gestorBD.insertarMensaje(mensaje, function (id) {
                                        if (id == null) {
                                            res.status(500);
                                            res.json({
                                                error: "se ha producido un error",

                                            })
                                        } else {
                                            res.status(201);
                                            res.json({
                                                mensaje: "mensaje insertado",
                                                _id: id
                                            })
                                        }
                                    });


                                }
                            });

                        }
                    }

                    else{
                        let criterioConversacion = {"_id": gestorBD.mongo.ObjectID(req.params.idConversacion)};
                        gestorBD.obtenerConversaciones(criterioConversacion,function(conversaciones){
                            if ( conversaciones == null ){
                                res.status(500);
                                res.json({
                                    error : "se ha producido un error"
                                })
                            } else {
                                if(conversaciones.length===0){
                                    res.status(200);
                                    res.json({
                                        error: "No existen conversaciones con este id"
                                    })
                                }


                                else if(conversaciones[0].idOferta.toString()!==ofertas[0]._id.toString()){

                                    res.status(200);
                                    res.json({
                                        error: "Esta coversación no pertenece a la oferta proporcionada"
                                    })
                                }
                                else {
                                    let mensaje = {
                                        idConversacion: conversaciones[0]._id,
                                        autor: app.get("jwt").verify(req.headers.token, 'secreto').usuario,
                                        texto: req.body.texto,
                                        fecha: new Date(),
                                        leido: false
                                    }
                                    gestorBD.insertarMensaje(mensaje, function (id) {
                                        if (id == null) {
                                            res.status(500);
                                            res.json({
                                                error: "se ha producido un error",

                                            })
                                        } else {
                                            res.status(201);
                                            res.json({
                                                mensaje: "mensaje insertado",
                                                _id: id
                                            })
                                        }
                                    });
                                }

                            }
                        });


                    }
                }
            });




    });


    app.get("/api/mensajes/:id/:receptor", function(req, res) {
        console.log(app.get("jwt").verify(req.headers.token, 'secreto').usuario)

        let criterio = {
            "idOferta": gestorBD.mongo.ObjectID(req.params.id),
            $or: [{"emailInteresado": app.get("jwt").verify(req.headers.token, 'secreto').usuario,"emailPropietario":req.params.receptor  },
                {"emailPropietario": app.get("jwt").verify(req.headers.token, 'secreto').usuario,"emailInteresado":req.params.receptor}]
        };


        gestorBD.obtenerConversaciones(criterio,function(conversaciones){
            if ( ofertas == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                let criterioMensajes = {"idConversacion": ofertas[0]._id};
                gestorBD.obtenerMensajes(criterioMensajes,function(mensajes){

                    if ( ofertas == null ){
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else {

                        res.status(200);
                        res.send( JSON.stringify(mensajes));
                    }
                });


            }
        });
    });








}