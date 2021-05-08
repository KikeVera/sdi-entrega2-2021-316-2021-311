function widgetLogin(){
    $( "#contenedor-principal" ).load( "../widget-login.html");

}

function widgetOfertas(){
    $( "#contenedor-principal" ).load( "../widget-ofertas.html");
}

function desconectar(){
    token=null;
    Cookies.remove('token');
    $( "#contenedor-principal" ).load( "../widget-login.html");
    updateNav();
}