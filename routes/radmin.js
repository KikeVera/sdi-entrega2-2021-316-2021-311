module.exports = function(app,swig,gestorBD) {


    app.get("/admin/users", function(req, res) {
        let criterio = {email:{$ne: 'admin@email.com'}}
        gestorBD.obtenerUsuarios(criterio, function( allUsers ) {
            if (allUsers == null) {
                res.redirect("/");
            } else {
                let respuesta = swig.renderFile('views/badmin.html',
                    {
                        users : allUsers
                    });
                res.send(respuesta);
            }
        });
    });

    app.post("/admin/users/delete", function(req, res) {


        var users=req.body.checkboxUser;
        if(Array.isArray(users)){
            for(let i=0;i<users.length;i++) {
                let criterio = {"email" : users[i] };
                gestorBD.eliminarUsuario(criterio, function( users ) {

                    if ( users == null ){
                        res.redirect("/admin/users?tipoMensaje=alert-danger&mensaje=Error al borrar usuarios");
                    }

                });

            }
        }
        else if(users!==undefined){
            let criterio = {"email" : users };
            gestorBD.eliminarUsuario(criterio, function( users ) {

                if ( users == null ){
                    res.redirect("/admin/users?tipoMensaje=alert-danger&mensaje=Error al borrar usuarios");
                }

            });

        }



        res.redirect("/admin/users");
    });


};