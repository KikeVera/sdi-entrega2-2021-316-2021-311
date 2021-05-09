function widgetLogin(){
    $( "#contenedor-principal" ).load( "../widget-login.html");

}

function widgetOfertas(){
    $( "#contenedor-principal" ).load( "../widget-ofertas.html");
}

function widgetConversaciones(){
    $( "#contenedor-principal" ).load("widget-conversationList.html");
}

function desconectar(){
    token=null;
    Cookies.remove('token');
    Cookies.remove('email');
    $( "#contenedor-principal" ).load( "../widget-login.html");
    updateNav();
}

function mostrarConversacion(idOferta){

    Cookies.set('idOferta', idOferta);
    $( "#contenedor-principal" ).load( "../widget-conversacion.html");

}
