module.exports = function(app,swig,gestorBD) {

    app.get("/ofertas/tienda", function(req, res) {
        let criterio = {};
        if( req.query.busqueda != null ){
            criterio = { "titulo" : new RegExp(req.query.busqueda,'i') };
        }
        console.log(criterio);
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
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        ofertas : ofertas,
                        paginas : paginas,
                        actual : pg,
                        user : req.session.usuario
                    });
                res.send(respuesta);
            }
        });
    });


    app.get("/ofertas/agregar", function(req, res) {
        let respuesta = swig.renderFile('views/bagregar.html', {});
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



        let oferta = {
            vendedor:req.session.usuario,
            titulo : req.body.titulo,
            detalles : req.body.detalles,
            precio : req.body.precio,
            fecha: new Date(),
            comprada:false
        }

        // Conectarse
        gestorBD.insertarOferta(oferta, function(id){
            if (id == null) {
                res.redirect("/ofertas/agregar?mensaje=Error al dar de alta oferta");
            } else {

                res.redirect('/ofertas/propias');

            }
        });


    });

    app.get("/ofertas/propias", function(req, res) {
        let criterio = { vendedor : req.session.usuario };
        gestorBD.obtenerOfertas(criterio, function(ofertas) {
            if (ofertas == null) {
                res.redirect("/ofertas/agregar?mensaje=Error al obtener ofertas propias");
            } else {
                let respuesta = swig.renderFile('views/bofertaspropias.html',
                    {
                        ofertas : ofertas
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
                if(ofertas[0].comprada)
                    res.redirect("/ofertas/tienda?mensaje=La oferta ya ha sido comprada");

                gestorBD.eliminarOferta(criterio,function(canciones){
                    if ( canciones == null ){
                        res.redirect("/ofertas/propias?mensaje=Error al borrar oferta");
                    } else {
                        res.redirect("/ofertas/propias");
                    }
                });



            }
        });




    })




};