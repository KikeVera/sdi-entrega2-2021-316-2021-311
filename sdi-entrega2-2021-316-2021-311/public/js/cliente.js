
//Se inicializan las variables, el token, la url y dos id que se usarán en la conversación de una oferta
let token;
let idOfertaSeleccionada;
let idConversacion;
let URLbase = "https://localhost:8081/api";


//Se obtiene el tooken de las cookies
token = Cookies.get('token');
//Se obtiene cual fue la ultima página a la que se accedió
let url = new URL(window.location.href);
let w = url.searchParams.get("w");

//Si se tiene almacenada alguna se accede a ella
if ( w === "login"){
    $( "#contenedor-principal" ).load("widget-login.html");
}
else if ( w === "ofertas"){
    $( "#contenedor-principal" ).load("widget-ofertas.html");
}

else if ( w === "conversacion"){
    $( "#contenedor-principal" ).load("widget-conversacion.html");
}
else if ( w === "conversationList"){
    $( "#contenedor-principal" ).load("widget-conversationList.html");
}

//Si no se tiene ninguna se accede a ofertas si se está logeado y al login si no se está
else{
    if ( token != null ) {
        $( "#contenedor-principal" ).load("widget-ofertas.html");
    }

    else{
        $( "#contenedor-principal" ).load("widget-login.html");
    }

}

updateNav();

//Función para actualizar la barra de navegación
function updateNav(){
    let izq= $("#barra-menu");
    let der= $("#barra-menu-derecha");
    //Se limpian el html de las dos secciones de la barra

   izq.empty();
   der.empty();

    //Si estamos logeados se muestran los lugares donde podemos acceder deslogeados
    if ( token != null ) {
        izq.append(
            " <li id='mOfertas'><a onClick=widgetOfertas()> Ofertas</li>"
        );
        izq.append(
            " <li id='mConversaciones'><a onClick=widgetConversaciones()> Mis conversaciones</li>"
        );
        der.append(
            "<li id='mdesconectar'><a onclick=desconectar()><span class=\"glyphicon glyphicon-log-out\"></span> Desconectar</a></li>"

        );
    }
    //Si no lo estamos se muestra el login
    else{
        der.append(
            "<li id='mLogin'><a onclick=widgetLogin()><span class='glyphicon glyphicon-log-in'></span> Identifícate</a></li>"

        );

    }
}


