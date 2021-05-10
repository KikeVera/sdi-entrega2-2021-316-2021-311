
//Función para cargar el html del login
function widgetLogin(){
    $( "#contenedor-principal" ).load( "../widget-login.html");

}

//Función para cargar el html de las ofertas
function widgetOfertas(){
    $( "#contenedor-principal" ).load( "../widget-ofertas.html");
}

//Función para cargar el html de las conversaciones
function widgetConversaciones(){
    $( "#contenedor-principal" ).load("widget-conversationList.html");
}

//Funcion para desconectar al usuario
function desconectar(){
    //Se pone el token a null
    token=null;
    //Se borran las cookies de la sesion
    Cookies.remove('token');
    Cookies.remove('email');
    //Se carga el login
    $( "#contenedor-principal" ).load( "../widget-login.html");
    //Se actualiza la barra de navegacion
    updateNav();
}

//Función para cargar el html de una conversacion
function mostrarConversacion(idOferta){
    //Se guarda en las cookies el id de la oferta para usarlo mas adelante en la conversación
    Cookies.set('idOferta', idOferta);
    $( "#contenedor-principal" ).load( "../widget-conversacion.html");

}
