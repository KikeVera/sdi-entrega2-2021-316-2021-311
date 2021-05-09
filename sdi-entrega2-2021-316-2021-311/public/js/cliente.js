let token;
let idOfertaSeleccionada;
let idConversacion;
let URLbase = "https://localhost:8081/api";



token = Cookies.get('token');
let url = new URL(window.location.href);
let w = url.searchParams.get("w");
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

else{
    if ( token != null ) {
        $( "#contenedor-principal" ).load("widget-ofertas.html");
    }

    else{
        $( "#contenedor-principal" ).load("widget-login.html");
    }

}

updateNav();

function updateNav(){
    $("#barra-menu").empty();
    $("#barra-menu-derecha").empty();

    if ( token != null ) {
        $("#barra-menu").append(
            " <li id='mOfertas'><a onClick=widgetOfertas()> Ofertas</li>"
        );
        $("#barra-menu").append(
            " <li id='mConversaciones'><a onClick=widgetConversaciones()> Mis conversaciones</li>"
        );
        $("#barra-menu-derecha").append(
            "<li id='mdesconectar'><a onclick=desconectar()><span class=\"glyphicon glyphicon-log-out\"></span> Desconectar</a></li>"

        );
    }
    else{
        $("#barra-menu-derecha").append(
            "<li id='mLogin'><a onclick=widgetLogin()><span class='glyphicon glyphicon-log-in'></span> Identifícate</a></li>"

        );

    }
}


