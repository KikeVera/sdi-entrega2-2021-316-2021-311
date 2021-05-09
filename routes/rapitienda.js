module.exports = function(app, gestorBD) {



    app.post("/api/autenticar", function(req, res) {


        if(req.body.email==="" || req.body.password.trim()===""){
            res.status(400);
            res.json({
                autenticado : false,
                error:"No pueden existir campos vacíos"
            })
            return;
        }

        let seguro=app.get("crypto").createHmac('sha256', app.get('clave')).update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        }

        let criterioEmail = {
            email: req.body.email

        }


        gestorBD.obtenerUsuarios(criterioEmail, function(usuarios){
            if (usuarios == null || usuarios.length===0) {
                res.status(400);
                res.json({
                   autenticado : false,
                    error:"El usuario no existe"
                })

            } else {
                gestorBD.obtenerUsuarios(criterio, function(usuarios){
                    if (usuarios == null || usuarios.length===0) {
                        res.status(400);
                        res.json({
                            autenticado : false,
                            error:"Contraseña no válida"
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



    app.post("/api/mensajes/enviar/:idOferta/:idConversacion?", function(req, res) {
        console.log("ggg")
        let criterioOferta = {"_id": gestorBD.mongo.ObjectID(req.params.idOferta)};



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
                        let criterioConversacion = {"_id": gestorBD.mongo.ObjectID(req.params.idConversacion), $or:
                                [{"emailInteresado": app.get("jwt").verify(req.headers.token, 'secreto').usuario },
                                {"emailPropietario":app.get("jwt").verify(req.headers.token, 'secreto').usuario}]};
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
                                        error: "No existen conversaciones tuyas con este id"
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


    app.get("/api/mensajes/:idConversacion", function(req, res) {

        let criterioConversacion = {"_id": gestorBD.mongo.ObjectID(req.params.idConversacion), $or:
                [{"emailInteresado": app.get("jwt").verify(req.headers.token, 'secreto').usuario },
                    {"emailPropietario":app.get("jwt").verify(req.headers.token, 'secreto').usuario}]};



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
                        error: "No existen conversaciones tuyas con este id"
                    })

                }
                else {
                    let criterioMensajes = {"idConversacion": conversaciones[0]._id};
                    gestorBD.obtenerMensajes(criterioMensajes, function (mensajes) {

                        if (mensajes == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error"
                            })
                        } else {

                            res.status(200);
                            res.send(JSON.stringify(mensajes));
                        }
                    });
                }


            }
        });


    });

    app.get("/api/conversaciones/:idOferta?", function(req, res) {

        let criterioConversacionInteresado;
        if (req.params.idOferta === undefined) {
            criterioConversacionInteresado = {"emailInteresado": app.get("jwt").verify(req.headers.token, 'secreto').usuario};
        }
        else{
            criterioConversacionInteresado = {"emailInteresado": app.get("jwt").verify(req.headers.token, 'secreto').usuario,
                "idOferta":gestorBD.mongo.ObjectID(req.params.idOferta)};
        }



        gestorBD.obtenerConversaciones(criterioConversacionInteresado,function(conversacionesInteresado){
            if ( conversacionesInteresado == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                console.log(conversacionesInteresado);
                let criterioConversacionPropietario;
                if (req.params.idOferta === undefined) {
                    criterioConversacionPropietario = {"emailPropietario": app.get("jwt").verify(req.headers.token, 'secreto').usuario};
                }
                else{
                    criterioConversacionPropietario = {"emailPropietario": app.get("jwt").verify(req.headers.token, 'secreto').usuario,
                        "idOferta":gestorBD.mongo.ObjectID(req.params.idOferta)};
                }
                gestorBD.obtenerConversaciones(criterioConversacionPropietario,function(conversacionesPropietario){
                    if ( conversacionesPropietario == null ){
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else {
                        console.log(conversacionesPropietario);
                        res.status(200);
                        let conversaciones={
                            "interesado":conversacionesInteresado,
                            "propietario":conversacionesPropietario

                        }


                            res.send(JSON.stringify(conversaciones));




                    }
                });






            }
        });


    });

    app.delete("/api/conversaciones/:idConversacion", function(req, res) {
        let criterioConversacion = {"_id": gestorBD.mongo.ObjectID(req.params.idConversacion), $or:
                [{"emailInteresado": app.get("jwt").verify(req.headers.token, 'secreto').usuario },
                    {"emailPropietario":app.get("jwt").verify(req.headers.token, 'secreto').usuario}]};


        gestorBD.eliminarConversaciones(criterioConversacion,function(conversaciones){
            if ( conversaciones == null ){

                res.status(500);
                res.json({
                    error:"se ha producido un error"
                })
            } else {
                let criterioMensajes = {"idConversacion":gestorBD.mongo.ObjectID(req.params.idConversacion)};
                console.log(criterioMensajes);
                gestorBD.eliminarMensajes(criterioMensajes,function(mensajes){
                    if ( mensajes == null ){

                        res.status(500);
                        res.json({
                            error:"se ha producido un error"
                        })
                    } else {


                        res.status(200);
                        res.send(JSON.stringify(conversaciones));

                    }
                });


            }
        });
    });

    app.put("/api/mensajes/leer/:idMensaje", function(req, res) {




        let criterioMensaje = {
            "_id": gestorBD.mongo.ObjectID(req.params.idMensaje)

        };
        console.log(criterioMensaje);
        gestorBD.obtenerMensajes(criterioMensaje,function(mensajes){
            if ( mensajes == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                if(mensajes.length>0) {
                    let criterioConversacion = {
                        "_id": mensajes[0].idConversacion, $or:
                            [{"emailInteresado": app.get("jwt").verify(req.headers.token, 'secreto').usuario},
                                {"emailPropietario": app.get("jwt").verify(req.headers.token, 'secreto').usuario}]
                    };

                    gestorBD.obtenerConversaciones(criterioConversacion, function (conversaciones) {
                        if (conversaciones == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error"
                            })
                        } else {
                            if (conversaciones.length > 0 && mensajes[0].autor !== app.get("jwt").verify(req.headers.token, 'secreto').usuario) {
                                let mensaje = {"leido": true};

                                gestorBD.modificarMensaje(criterioMensaje, mensaje, function (result) {
                                    if (result == null) {
                                        res.status(500);
                                        res.json({
                                            error: "se ha producido un error"
                                        })
                                    } else {

                                        res.status(200);
                                        res.json({
                                            mensaje: "mensaje leido",
                                            _id: req.params.id
                                        })
                                    }
                                });


                            } else {

                                res.status(200);
                                res.json({
                                    error: "No se puede marcar como leido este mensaje"
                                })


                            }


                        }
                    });


                }

                else{
                    res.status(200);
                    res.json({
                        error: "El mensaje no existe"
                    })
                }
            }
        });




    });



    app.get("/api/allSales", function(req, res) {
        let criterio = {};


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







}