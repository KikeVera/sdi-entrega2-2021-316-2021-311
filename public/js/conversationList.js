
function cargarConversaciones(){
    $.ajax({
        url: URLbase + "/conversaciones",
        type: "GET",
        data: { },
        dataType: 'json',
        headers: { "token": token },
        success: function(respuesta) {
            let conversations = respuesta;
            obtenerOfertas(conversations);
        },
        error : function (error){
            desconectar();
            $("p").remove(".alert-danger");

            if(error.status===403)
                $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
            else
                $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");
        }
    });
}
function obtenerOfertas(conversaciones){
    $.ajax({
        url: URLbase + "/allSales",
        type: "GET",
        data: { },
        dataType: 'json',
        headers: { "token": token },
        success: function(respuesta) {
            let sales = respuesta;
            mostrarConversaciones(sales,conversaciones);
        },
        error : function (error){
            desconectar();
            $("p").remove(".alert-danger");

            if(error.status===403)
                $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
            else
                $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");
        }
    });
}
function mostrarConversaciones (ofertas,conversaciones){

    $( "#conversationList" ).empty(); // Vaciar la tabla
    for (let i = 0; i < conversaciones.interesado.length; i++) {
        $( "#conversationList" ).append(
            "<tr id="+conversaciones.interesado[i]._id+">"+
            "<td>"+conversaciones.interesado[i].emailPropietario+"</td>" +
            "<td>"+obtenerTituloDeOferta(ofertas,conversaciones.interesado[i].idOferta)+"</td>" +
            "<td id=\"numeroDeMensajesSinLeer"+ conversaciones.interesado[i]._id+"\" ></td>" +
            "<td>"+ "<a onclick=mostrarConversacion('"+conversaciones.interesado[i].idOferta+"')>Conversar</a>"+ "</td>" +
            "<td>"+ "<a onclick=eliminarConversacion('"+conversaciones.interesado[i]._id+"')>Eliminar</a>"+ "</td>"+
            "</tr>" );
        actualizarMensajesSinLeer(conversaciones.interesado[i]._id);
    }
    for (let i = 0; i < conversaciones.propietario.length; i++) {
        $( "#conversationList" ).append(
            "<tr id="+conversaciones.propietario[i]._id+">"+
            "<td>"+conversaciones.propietario[i].emailInteresado+"</td>" +
            "<td>"+obtenerTituloDeOferta(ofertas,conversaciones.propietario[i].idOferta)+"</td>" +
            "<td id=\"numeroDeMensajesSinLeer"+conversaciones.propietario[i]._id+"\"></td>" +
            "<td>"+ "<a onclick=mostrarConversacion('"+conversaciones.propietario[i].idOferta+"')>Conversar</a>"+ "</td>"+
            "<td>"+ "<a onclick=eliminarConversacion('"+conversaciones.propietario[i]._id+"')>Eliminar</a>"+ "</td>"+
            "</tr>" );
        actualizarMensajesSinLeer(conversaciones.propietario[i]._id);
    }
}

function obtenerTituloDeOferta(ofertas,idOferta){

    for (let i = 0; i < ofertas.length; i++) {
        if(ofertas[i]._id.toString()=== idOferta.toString()){
            return ofertas[i].titulo;
        }
    }
}
function eliminarConversacion(id){
    $.ajax({
        url: URLbase + "/conversaciones/" + id,
        type: "DELETE",
        data: { },
        dataType: 'json',
        headers: { "token": token },
        success: function() {
            $( "#"+id).remove();
        },
        error : function (error){
            desconectar();
            $("p").remove(".alert-danger");

            if(error.status===403)
                $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
            else
                $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");
        }
    });
}

function actualizarMensajesSinLeer(id){
    $.ajax({
        url: URLbase + "/mensajes/" + id,
        type: "GET",
        data: { },
        dataType: 'json',
        headers: { "token": token },
        success: function(result) {
            let mensajesSinLeer=0
            for(let i = 0 ; i <result.length;i++){
                if(!result[i].leido && result[i].autor !== Cookies.get('email')){
                    mensajesSinLeer++;
                }
            }
            $( "#numeroDeMensajesSinLeer"+id).html(""+mensajesSinLeer);
            actualizarMensajesSinLeer(id);
        },
        error : function (error){
            desconectar();
            $("p").remove(".alert-danger");

            if(error.status===403)
                $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
            else
                $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");
        }
    });
}

if ( Cookies.get('token') === null ) {
    $("#contenedor-principal").load("widget-login.html");
}
else {
    cargarConversaciones();
}