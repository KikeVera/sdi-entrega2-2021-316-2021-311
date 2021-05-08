
var ofertas;
function cargarOfertas(){
    $.ajax({
        url: URLbase + "/ofertas",
        type: "GET",
        data: { },
        dataType: 'json',
        headers: { "token": token },
        success: function(respuesta) {
            ofertas = respuesta;
            actualizarTabla(ofertas);
        },
        error : function (error){
            $( "#contenedor-principal" ).load("widget-login.html");
        }
    });
}
function actualizarTabla(ofertasMostrar){

    $( "#tablaCuerpo" ).empty(); // Vaciar la tabla
    for (i = 0; i < ofertasMostrar.length; i++) {
        $( "#tablaCuerpo" ).append(
            "<tr id="+ofertasMostrar[i]._id+">"+
            "<td>"+ofertasMostrar[i].titulo+"</td>" +
            "<td>"+ofertasMostrar[i].detalles+"</td>" +
            "<td>"+ofertasMostrar[i].precio+"</td>" +
            "<td>"+ofertasMostrar[i].vendedor+"</td>" +

            "</tr>" );

    }
}

if ( Cookies.get('token') === null ) {
    $("#contenedor-principal").load("widget-login.html");
}
else {
    cargarOfertas();
}




