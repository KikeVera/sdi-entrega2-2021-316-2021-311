module.exports = function(app, gestorBD) {


    //Petición para autenticar el usuario
    app.post("/api/autenticar", function(req, res) {
        app.get("logger").info("Petición a la API para autenticar");
        //Devolvemos un error si alguno de los campos está vació
        if(req.body.email==="" || req.body.password.trim()===""){
            app.get("logger").error("Campos vacíos");
            //Código de error
            res.status(400);
            //Mensaje de error enviado al cliente
            res.json({
                autenticado : false,
                error:"No pueden existir campos vacíos"
            })
            return;
        }

        //Obtenemos el password codificado para comprobar en la base de datos si es correcto
        let seguro=app.get("crypto").createHmac('sha256', app.get('clave')).update(req.body.password).digest('hex');

        let criterio = {
            email: req.body.email,
            password: seguro
        }

        let criterioEmail = {
            email: req.body.email

        }

        //Primero comprobamos si eexiste un usuario con el email enviado devolviendo un error si no existe
        gestorBD.obtenerUsuarios(criterioEmail, function(usuarios){
            if (usuarios == null || usuarios.length===0) {
                app.get("logger").error("El usuario no existe");
                //Código de error
                res.status(400);
                //Mensaje de error enviado al cliente
                res.json({
                   autenticado : false,
                    error:"El usuario no existe"
                })

            } else {
                //Si el email existe comprobamos que existe con la contraseña proporcionada
                gestorBD.obtenerUsuarios(criterio, function(usuarios){
                    if (usuarios == null || usuarios.length===0) {
                        app.get("logger").error("Contraseña no válida");
                        //Código de error
                        res.status(400);
                        //Mensaje de error enviado al cliente
                        res.json({
                            autenticado : false,
                            error:"Contraseña no válida"
                        })
                    } else {
                        //El caso de que este correcto  creamos un token de identificación para el usuario y se lo enviamos en la respuesta
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


    //Petición para obtener las ofertas del sistema
    app.get("/api/ofertas", function(req, res) {
        app.get("logger").info("Petición a la API para obtener las ofertas");


        //El criterio será que dichas ofertas no pertenezcan al usuario autenticado
        let criterio = {
            vendedor:{ $ne:app.get("jwt").verify(req.headers.token, 'secreto').usuario}
        };
        //Obtenemos las ofertas en mongoDB y se las mandamos al cliente en formato JSON si se realiza correctamente la busqueda
        gestorBD.obtenerOfertas(criterio,function(ofertas){
            if ( ofertas == null ){
                app.get("logger").fatal("Se ha producido un error obteniendo las ofertas");
                res.status(500);
                res.json({
                    error : "Se ha producido un error obteniendo las ofertas"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(ofertas));
            }
        });
    });



    //Petición para enviar un mensaje a una oferta
    //La url de la oferta tiene un campo obligatorio que es el del id de la oferta y uno opcional que es el de la conversación
    //Si se proporciona el id de la conversación se enviará el mensaje a esta, sino se creará una nueva
    app.post("/api/mensajes/enviar/:idOferta/:idConversacion?", function(req, res) {
        app.get("logger").info("Petición a la API para enviar un mensaje");

        let criterioOferta = {"_id": gestorBD.mongo.ObjectID(req.params.idOferta)};


            //En primer lugar obtenemos la ofera con el id proporcionado
            gestorBD.obtenerOfertas(criterioOferta,function(ofertas){
                if ( ofertas == null ){
                    app.get("logger").fatal("Se ha producido un error obteniedo las ofertas");
                    res.status(500);
                    res.json({
                        error : "Se ha producido un error obteniendo las ofertas"
                    })
                } else {
                    //Si el id de la oferta es erroneo devolvemos un error
                    if(ofertas.length===0){
                        app.get("logger").error("No existen ofertas con este id");
                        res.status(400);
                        res.json({
                            error: "No existen ofertas con este id"
                        })
                    }
                    //Comprobamos ahora el caso en el que no se ha proporcionado la conversación
                    else if (req.params.idConversacion === undefined) {
                        //Si la oferta pertenece al usuario identificado se devuelve un error ya que un usuario
                        //no puede iniciar una conversación en su propoa oferta
                        if (ofertas[0].vendedor === app.get("jwt").verify(req.headers.token, 'secreto').usuario) {
                            app.get("logger").error("No se puede iniciar una conversación en tu propia oferta");
                            res.status(400);
                            res.json({
                                error: "No se puede iniciar una conversación en tu propia oferta"
                            })
                        //Si la oferta no pertence al usuario se puede continuar
                        } else {
                            //Se crea una nueva conversación
                            let conversacion = {
                                idOferta: gestorBD.mongo.ObjectID(req.params.idOferta),
                                emailInteresado: app.get("jwt").verify(req.headers.token, 'secreto').usuario,
                                emailPropietario: ofertas[0].vendedor,

                            }
                            //Se inserta dicha conversación
                            gestorBD.insertarConversacion(conversacion, function (id) {
                                app.get("logger").fatal("Se ha producido un error obteniendo las conversaciones");
                                if (id == null) {
                                    res.status(500);
                                    res.json({
                                        error: "Se ha producido un error obteniendo las conversaciones",

                                    })
                                } else {
                                    //Si se inserta la conversación correctamente creamos el mensaje (asociado con la conversación reciñen creada)
                                    let mensaje = {
                                        idConversacion: id,
                                        autor: app.get("jwt").verify(req.headers.token, 'secreto').usuario,
                                        texto: req.body.texto,
                                        fecha: new Date(),
                                        leido: false
                                    }

                                    //Se inserta el mensaje
                                    gestorBD.insertarMensaje(mensaje, function (id) {
                                        if (id == null) {
                                            app.get("logger").fatal("Se ha producido un error insertando el mensaje");
                                            res.status(500);
                                            res.json({
                                                error: "Se ha producido un error insertando el mensaje",

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

                    //Si se proporciona el id de la conversacion
                    else{
                        //Buscamos la conversacion ya seamos el interesado o el propietario
                        let criterioConversacion = {"_id": gestorBD.mongo.ObjectID(req.params.idConversacion), $or:
                                [{"emailInteresado": app.get("jwt").verify(req.headers.token, 'secreto').usuario },
                                {"emailPropietario":app.get("jwt").verify(req.headers.token, 'secreto').usuario}]};
                        gestorBD.obtenerConversaciones(criterioConversacion,function(conversaciones){
                            if ( conversaciones == null ){
                                app.get("logger").fatal("Se ha producido un error obteniendo las conversaciones");
                                res.status(500);
                                res.json({
                                    error : "Se ha producido un error obteniendo las conversaciones"
                                })
                            } else {
                                //Si el id no pertenece a ninguna conversación del usuario se devuelve un error
                                if(conversaciones.length===0){
                                    app.get("logger").error("No existen conversaciones tuyas con este id");
                                    res.status(400);
                                    res.json({
                                        error: "No existen conversaciones tuyas con este id"
                                    })
                                }

                                //Si existe la conversacion pero no pertenece a la oferta proporcionada se devuelve otro error
                                else if(conversaciones[0].idOferta.toString()!==ofertas[0]._id.toString()){
                                    app.get("logger").error("Esta coversación no pertenece a la oferta proporcionada");
                                    res.status(400);
                                    res.json({
                                        error: "Esta coversación no pertenece a la oferta proporcionada"
                                    })
                                }
                                else {
                                    //Si los parámetros son correctos se crea el mensaje
                                    let mensaje = {
                                        idConversacion: conversaciones[0]._id,
                                        autor: app.get("jwt").verify(req.headers.token, 'secreto').usuario,
                                        texto: req.body.texto,
                                        fecha: new Date(),
                                        leido: false
                                    }
                                    //Se inserta el mensaje en la base de datos
                                    gestorBD.insertarMensaje(mensaje, function (id) {
                                        if (id == null) {
                                            app.get("logger").fatal("Se ha producido un error insertando el mensaje");
                                            res.status(500);
                                            res.json({
                                                error: "sSe ha producido un error insertando el mensaje",

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


    //Petición para obtener los mensajes de una conversación
    app.get("/api/mensajes/:idConversacion", function(req, res) {
        app.get("logger").info("Petición a la API para obtener los mensajes de una conversación");
        //El criterio será el id de la conversación proporcionada y que el interesado o el propietario sea el usuario identificado
        let criterioConversacion = {"_id": gestorBD.mongo.ObjectID(req.params.idConversacion), $or:
                [{"emailInteresado": app.get("jwt").verify(req.headers.token, 'secreto').usuario },
                    {"emailPropietario":app.get("jwt").verify(req.headers.token, 'secreto').usuario}]};


        //Se obtienen las conversaciones
        gestorBD.obtenerConversaciones(criterioConversacion,function(conversaciones){
            if ( conversaciones == null ){
                app.get("logger").fatal("Se ha producido un error obteniendo las conversaciones");
                res.status(500);
                res.json({
                    error : "Se ha producido un error obteniendo las conversaciones"
                })
            } else {
                //Si no se ha podido obtener la conversación se informa de que no existen conversaciones
                //del usuario con ese id de conversacion
                if(conversaciones.length===0){
                    app.get("logger").error("No existen conversaciones tuyas con este id");
                    res.status(400);
                    res.json({
                        error: "No existen conversaciones tuyas con este id"
                    })

                }
                else {
                    //Si se obtiene la conversación se manda como respuesta los mensajes con el id de dicha conversacion
                    //en formato json
                    let criterioMensajes = {"idConversacion": conversaciones[0]._id};
                    gestorBD.obtenerMensajes(criterioMensajes, function (mensajes) {

                        if (mensajes == null) {
                            app.get("logger").fatal("Se ha producido un error obteniendo los mensajes");
                            res.status(500);
                            res.json({
                                error : "Se ha producido un error obteniendo los mensajes"
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

    //Petición para obtener todas las conversaciones de un usuuario
    //Opcionalmente se puede pasar el id de una oferta para obtener solo las conversaciones asociadas a esa oferta
    app.get("/api/conversaciones/:idOferta?", function(req, res) {
        app.get("logger").info("Petición a la API para obtener las conversaciones de un usuario");
        //Si se pasa como parámetro el id de la oferta se añade al criteriom sino este solo será el usuario identificado

        //En primer lugar se obtienen las conversaciones en las que se está como interesado
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
                app.get("logger").fatal("Se ha producido un error obteniendo las conversaciones");
                res.status(500);
                res.json({
                    error : "Se ha producido un error obteniendo las conversaciones"
                })
            } else {
                //Si se obtienen bién se obtienen las conversaciones en las que se está como propietario
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
                        app.get("logger").fatal("Se ha producido un error obteniendo las conversaciones");
                        res.status(500);
                        res.json({
                            error : "Se ha producido un error obteniendo las conversaciones"
                        })
                    } else {
                        //Al obtener todas las conversaciones se mandan en la respuesta en formato json
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

    //Petición para borrar una conversación
    app.delete("/api/conversaciones/:idConversacion", function(req, res) {
        app.get("logger").info("Petición a la API para borrar una conversación");
        //El criterio contedrá el id de la conversación proporcionado y un "or" de que el usuario identificado
        //coincida con el interesado o el propietario
        let criterioConversacion = {"_id": gestorBD.mongo.ObjectID(req.params.idConversacion), $or:
                [{"emailInteresado": app.get("jwt").verify(req.headers.token, 'secreto').usuario },
                    {"emailPropietario":app.get("jwt").verify(req.headers.token, 'secreto').usuario}]};


        //Se elimina la conversación
        gestorBD.eliminarConversacionesCascada(criterioConversacion,function(conversaciones){
            if ( conversaciones == null ){
                app.get("logger").fatal("Se ha producido un error eliminando conversaciones");
                res.status(500);
                res.json({
                    error : "Se ha producido un error eliminando conversaciones"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(conversaciones));
            }
        });
    });

    //Petición para leer una conversación

    app.put("/api/mensajes/leer/:idMensaje", function(req, res) {

        app.get("logger").info("Petición a la API para leer un mensaje");

        //El criterio será el id proporcionado
        let criterioMensaje = {
            "_id": gestorBD.mongo.ObjectID(req.params.idMensaje)

        };

        //Se obtienen el mensaje con ese id
        gestorBD.obtenerMensajes(criterioMensaje,function(mensajes){
            if ( mensajes == null ){
                app.get("logger").fatal("Se ha producido un error obteniendo los mensajes");
                res.status(500);
                res.json({
                    error : "Se ha producido un error obteniendo los mensajes"
                })
            } else {
                //Si podemos obtener el mensaje buscamos la conversacion de ese mensaje y donde el usuario
                // sea el propietario o el interesado
                if(mensajes.length>0) {
                    let criterioConversacion = {
                        "_id": mensajes[0].idConversacion, $or:
                            [{"emailInteresado": app.get("jwt").verify(req.headers.token, 'secreto').usuario},
                                {"emailPropietario": app.get("jwt").verify(req.headers.token, 'secreto').usuario}]
                    };

                    gestorBD.obtenerConversaciones(criterioConversacion, function (conversaciones) {
                        if (conversaciones == null) {
                            app.get("logger").fatal("Se ha producido un error obteniendo las conversaciones");
                            res.status(500);
                            res.json({
                                error : "Se ha producido un error obteniendo las conversaciones"
                            })
                        } else {
                            //Si se ha podido obtener el mensaje (porque pertenece a una conversación del usuario)
                            //Se modifica marcando el atributi leído como true.
                            if (conversaciones.length > 0 && mensajes[0].autor !== app.get("jwt").verify(req.headers.token, 'secreto').usuario) {
                                let mensaje = {"leido": true};

                                gestorBD.modificarMensaje(criterioMensaje, mensaje, function (result) {
                                    if (result == null) {
                                        app.get("logger").fatal("Se ha producido un error modificando mensajes");
                                        res.status(500);
                                        res.json({
                                            error : "Se ha producido un error modificando mensajes"
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
                                //Si el mensaje no pertenece a una conversación del usuario se devuelve un error
                                app.get("logger").error("No se puede marcar como leido este mensaje");
                                res.status(200);
                                res.json({
                                    error: "No se puede marcar como leido este mensaje"
                                })


                            }


                        }
                    });


                }

                else{
                    //Si el mensaje no existe se devuelve un error
                    app.get("logger").error("El mensaje no existe");
                    res.status(200);
                    res.json({
                        error: "El mensaje no existe"
                    })
                }
            }
        });




    });



    //Petición para obetener todas las ofertas, incluidas las propias
    app.get("/api/allSales", function(req, res) {
        app.get("logger").info("Petición a la API para obtener todas las ofertas");
        let criterio = {};

        gestorBD.obtenerOfertas(criterio,function(ofertas){

            if ( ofertas == null ){
                app.get("logger").fatal("Se ha producido un error obteniend las ofertas");
                res.status(500);
                res.json({
                    error : "Se ha producido un error obteniendo las ofertas"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(ofertas));
            }
        });
    });







}