let express=require('express');
let app=express();
let fs = require('fs');
let https = require('https');
let swig = require('swig');
let crypto = require('crypto');
let jwt = require('jsonwebtoken');
let rest = require('request');
app.set('rest',rest);
app.set('jwt',jwt);
app.set('clave','abcdefg');
app.set('crypto',crypto);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});

let fileUpload = require('express-fileupload');
app.use(fileUpload());

let bodyParser = require('body-parser');
let mongo = require('mongodb');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);
let expressSession = require('express-session');

app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if ( req.session.usuario ) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/usuario/identificarse");
    }
});
//Aplicar routerUsuarioSession
app.use("/ofertas/agregar",routerUsuarioSession);
app.use("/ofertas/propias",routerUsuarioSession);
app.use("/admin/users",routerUsuarioSession);


//routeradmin
let routerAdmin = express.Router();
routerAdmin.use(function(req, res, next) {
    console.log("routerAdmin");

    if(req.session.usuario.rol == "admin"){
        next();
    }else {
        res.redirect("/ofertas/tienda?mensaje=Solo los administradores pueden acceder a esta dirección");
    }
});

app.use("/admin/users",routerAdmin);


//routerEstandar
let routerEstandar = express.Router();
routerEstandar.use(function(req, res, next) {
    console.log("routerAdmin");


    gestorBD.obtenerUsuarios(
        {email: req.session.usuario }, function (usuarios) {
            console.log(usuarios[0]);
            if(usuarios[0].rol ==="estandar" ){
                next();
            } else {
                res.redirect("/ofertas/tienda?mensaje=Solo los usuarios pueden acceder a está dirección");
            }
        })
});

app.use("/ofertas/agregar",routerEstandar);
app.use("/ofertas/propias",routerEstandar);

// routerUsuarioToken
let routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    let token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe
                return;

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403); // Forbidden
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});
// Aplicar routerUsuarioToken
app.use('/api/mensajes/enviar', routerUsuarioToken);






app.use(express.static('public'));



app.set('port', 8081);
app.set('db','mongodb://sdi:sdi@cluster0-shard-00-00.p4zvd.mongodb.net:27017,cluster0-shard-00-01.p4zvd.mongodb.net:27017,' +
    'cluster0-shard-00-02.p4zvd.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-12gia1-shard-0&authSource=' +
    'admin&retryWrites=true&w=majority');


require("./routes/rusuarios.js")(app,swig,gestorBD); // (app, param1, param2, etc.)
require("./routes/rofertas.js")(app,swig,gestorBD); // (app, param1, param2, etc.)
require("./routes/radmin.js")(app,swig,gestorBD); // (app, param1, param2, etc.)

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app,swig,gestorBD); // (app, param1, param2, etc.)
require("./routes/rapitienda.js")(app, gestorBD);



app.get('/', function (req, res) {
    res.redirect('/ofertas/tienda');
})



app.use(function(err,req,res,next){
    console.log("Error producido: "+err)
    if(!res.headersSent){
        res.status(400);
        res.send("Recurso no disponible");
    }

});



https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
    console.log("Servidor activo");
});