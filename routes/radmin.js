module.exports = function(app,swig,gestorBD) {


    app.get("/admin/users", function(req, res) {
        let criterio = {email:{$ne: 'admin@email.com'}}
        gestorBD.obtenerUsuarios(criterio, function( allUsers ) {
            if (allUsers == null) {
                res.redirect("/");
            } else {
                let respuesta = swig.renderFile('views/bAdmin.html',
                    {
                        users : allUsers
                    });
                res.send(respuesta);
            }
        });
    });
};