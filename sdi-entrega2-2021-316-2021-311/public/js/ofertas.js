
var ofertas;
//Función para obtener las ofertas de la API
function cargarOfertas(){
    $.ajax({
        url: URLbase + "/ofertas",
        type: "GET",
        data: { },
        dataType: 'json',
        headers: { "token": token },
        success: function(respuesta) {
            //Si obtenemos correctamente las ofertas actulizamos la tabla con ellas
            ofertas = respuesta;
            actualizarTabla(ofertas);
        },
        error : function (error){
            //Si hay un error nos desconectamos
            desconectar();
            $("p").remove(".alert-danger");
            //Mostramos el error correspondiente

            if(error.status===403)
                $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
            else
                $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");
        }
    });
}

//Función para actualizar la tabla
function actualizarTabla(ofertasMostrar){

    var cuerpo=$( "#tablaCuerpo" );
    cuerpo.empty(); // Vaciar la tabla
    //Recorremos todas las ofertas
    for (i = 0; i < ofertasMostrar.length; i++) {
        //Para cada una mostramos todos sus datos en distintas columnas
        cuerpo.append(
            "<tr id="+ofertasMostrar[i]._id+">"+
            "<td>"+ofertasMostrar[i].titulo+"</td>" +
            "<td>"+ofertasMostrar[i].detalles+"</td>" +
            "<td>"+ofertasMostrar[i].precio+"</td>" +
            "<td>"+ofertasMostrar[i].vendedor+"</td>" +
            //En esta columna tendremos en enlace a la conversación
            "<td>"+ "<a onclick=mostrarConversacion('"+ofertasMostrar[i]._id+"')>Conversacion</a>"+ "</td>"+


            "</tr>" );

    }
}

//Si no estamos logeados nos redirigimos al login
if ( Cookies.get('token') === null ) {
    $("#contenedor-principal").load("widget-login.html");
}
else {
    //Si estamos logeados cargamos las ofertas automaticamente
    cargarOfertas();
}




