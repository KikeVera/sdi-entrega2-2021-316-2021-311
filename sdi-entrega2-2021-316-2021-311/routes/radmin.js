module.exports = function(app,swig,gestorBD) {


    app.get("/admin/users", function(req, res) {
        app.get("logger").info("Accediendo a la vista de la lista de usuarios");
        let criterio = {email:{$ne: 'admin@email.com'}}
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
    //TODO Aun no se borra todo lo relacionado con el usuario
    app.post("/admin/users/delete", function(req, res) {

        app.get("logger").info("Petición para borrar usuarios");
        let users=req.body.checkboxUser;
        let emails = []
        if(Array.isArray(users)){
            for(let i=0;i<users.length;i++) {
                emails.push(users[i]);
            }
            recursiveDelete(res,emails);
        }
        else if(users!==undefined){
            let criterio = {"email" : users };
            gestorBD.eliminarUsuario(criterio, function( users ) {

                if ( users == null ){
                    app.get("logger").fatal("Error al borrar usuarios");
                    res.redirect("/admin/users?tipoMensaje=alert-danger&mensaje=Error al borrar usuarios");
                }
                else{
                    res.redirect("/admin/users");
                }
            });

        }
    });
    function recursiveDelete(res,listaDeEmails){
        if(listaDeEmails.size() ===0){
            res.redirect("/admin/users");
        }else{
            let criterio = {"email" : listaDeEmails[0] };
            gestorBD.eliminarUsuario(criterio, function( user ) {

                if ( user == null ){
                    app.get("logger").fatal("Error al borrar usuarios");
                    res.redirect("/admin/users?tipoMensaje=alert-danger&mensaje=Error al borrar usuarios");
                }else{
                    recursiveDelete(listaDeEmails.pop());
                }

            });
        }
    }

};