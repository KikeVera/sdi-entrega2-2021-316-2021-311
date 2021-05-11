module.exports = function(app,swig,gestorBD) {


    app.get("/admin/users", function(req, res) {
        app.get("logger").info("Accediendo a la lista de usuarios");
        //Busca en la base de datos todos los usuarios diferentes al usuario administrador
        let criterio = {rol:{$ne: 'admin'}}
        gestorBD.obtenerUsuarios(criterio, function( allUsers ) {
            if (allUsers == null) {
                app.get("logger").fatal("Error accediendo a la vista de la lista de usuarios");
                res.redirect("/");
            } else {
                let respuesta = swig.renderFile('views/badmin.html',
                    {
                        users : allUsers,
                        user: req.session.usuario
                    });
                res.send(respuesta);
            }
        });
    });
    app.post("/admin/users/delete", function(req, res) {

        app.get("logger").info("Petición para borrar usuarios");
        let users=req.body.checkboxUser;
        let emails = []
        if(Array.isArray(users)){
            for(let i=0;i<users.length;i++) {
                emails.push(users[i]);
            }
            //Borra todos los usuarios de la lista recursivamente
            recursiveDelete(res,emails);

        }
        else if(users!==undefined){
            //Borra el usaurio dado de la base de datos con su informacion relacionada
            emails.push(users);
            recursiveDelete(res,emails);

        }
    });

    function recursiveDelete(res,listaDeEmails){
        if(listaDeEmails === undefined || listaDeEmails.length === 0){
            res.redirect("/admin/users");
        }else{
            //Elimina el usuario de la base de datos
            let criterio = {"email" : listaDeEmails[listaDeEmails.length-1] };
            gestorBD.eliminarUsuario(criterio, function( user ) {

                if ( user == null ){
                    app.get("logger").fatal("Error al borrar usuarios");
                    res.redirect("/admin/users?tipoMensaje=alert-danger&mensaje=Error al borrar usuarios");
                }else{
                    criterio = {vendedor:listaDeEmails[listaDeEmails.length-1]}
                    //Elimina las ofertas del usuario
                    gestorBD.eliminarOferta(criterio,function (oferta){
                       if(oferta == null){
                           app.get("logger").fatal("Error al borrar ofertas");
                           res.redirect("/admin/users?tipoMensaje=alert-danger&mensaje=Error al borrar las ofertas del usuario");
                       }else{
                           criterio = {emailInteresado: listaDeEmails[listaDeEmails.length-1]}
                           eliminarConversaciones(criterio);
                           criterio = {emailPropietario: listaDeEmails[listaDeEmails.length-1]}
                           eliminarConversaciones(criterio);
                           listaDeEmails.pop();
                           recursiveDelete(res,listaDeEmails);
                       }
                    });
                }
            });
        }
        function eliminarConversaciones(criterio) {
            gestorBD.obtenerConversaciones(criterio,function (conversaciones){
                if(conversaciones ==null){
                    return null;
                }else{
                    removeMensajesRecursivo(conversaciones);
                    gestorBD.eliminarConversaciones(criterio,function (eliminadas){
                        if(eliminadas == null){
                            return null;
                        }else{
                            return;
                        }
                    });
                }
            });

        }

    }
    function removeMensajesRecursivo(conversaciones){
        if(conversaciones.length===0){
            return;
        }
        let criterio = {"idConversacion" : conversaciones[conversaciones.length-1]._id};
        gestorBD.eliminarMensajes(criterio,function (mensajes){
            if(mensajes == null){
                res.redirect("/admin/users?tipoMensaje=alert-danger&mensaje=Error al borrar los mensajes");
            }else{
                return removeMensajesRecursivo(conversaciones.pop());
            }
        });
    }

};