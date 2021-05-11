
//Función para cargar las conversaciones
function cargarConversaciones(){
    $.ajax({
        url: URLbase + "/conversaciones",
        type: "GET",
        data: { },
        dataType: 'json',
        headers: { "token": token },
        success: function(respuesta) {
            //Si se obtiene correctamente llamamos a la función obtenerOfertas para obtener los datos de la oferta asociada a cada conversación

            obtenerOfertas(respuesta);
        },
        error : function (error){
            //Si hay un error nos desconectamos
            desconectar();
            $("p").remove(".alert-danger");
            //Mostramos el error correspondiente

            if(error.status===403)
                errorMostrar="Error cargando conversaciones, posiblemente su sesión este caducada";
            else
                errorMostrar=error.responseJSON.error;
        }
    });
}

//Función que obtiene todas las ofertas
function obtenerOfertas(conversaciones){
    $.ajax({
        url: URLbase + "/allSales",
        type: "GET",
        data: { },
        dataType: 'json',
        headers: { "token": token },
        success: function(respuesta) {
            //Le pasamos tanto las ofertas como las conversaciones a la función que mostrará la tabla

            mostrarConversaciones(respuesta,conversaciones);
        },
        error : function (error){
            //Si hay un error nos desconectamos
            desconectar();
            $("p").remove(".alert-danger");
            //Mostramos el error correspondiente

            if(error.status===403)
                errorMostrar="Error obteniendo ofertas, posiblemente su sesión este caducada";
            else
                errorMostrar=error.responseJSON.error;
        }
    });
}
//Función que mostrará la tabla de las conversaciones
function mostrarConversaciones (ofertas,conversaciones){


    let list=$( "#conversationList" );
    list.empty(); // Vaciar la tabla
    //Recorremos todas las conversaciones de interesado
    for (let i = 0; i < conversaciones.interesado.length; i++) {
        //Añadimos todos los campos a la tabla
        list.append(
            "<tr id="+conversaciones.interesado[i]._id+">"+
            "<td>"+conversaciones.interesado[i].emailPropietario+"</td>" +
            //En esta columna llamamos a la función que proporciona el titulo de la oferta asociada a la conversación que le pasemos
            "<td>"+obtenerTituloDeOferta(ofertas,conversaciones.interesado[i].idOferta)+"</td>" +
            //Mostramos el número de mensajes sin leer almacenados en la variable
            "<td id=\"numeroDeMensajesSinLeer"+ conversaciones.interesado[i]._id+"\" ></td>" +

            //Mostramos en estas columnas los enlaces para borrar o acceder a la conversación
            "<td>"+ "<a onclick=mostrarConversacion('"+conversaciones.interesado[i].idOferta+"')>Conversar</a>"+ "</td>" +
            "<td>"+ "<a onclick=eliminarConversacion('"+conversaciones.interesado[i]._id+"')>Eliminar</a>"+ "</td>"+
            "</tr>" );
        actualizarMensajesSinLeer(conversaciones.interesado[i]._id);
    }
    //Recorremos todas las conversaciones de propietario
    for (let i = 0; i < conversaciones.propietario.length; i++) {
        list.append(
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

//Función para obtener el titulo de la oferta del id que le pasemos
function obtenerTituloDeOferta(ofertas,idOferta){

    for (let i = 0; i < ofertas.length; i++) {
        if(ofertas[i]._id.toString()=== idOferta.toString()){
            return ofertas[i].titulo;
        }
    }
}

//Función que elmina la conversación
function eliminarConversacion(id){
    $.ajax({
        url: URLbase + "/conversaciones/" + id,
        type: "DELETE",
        data: { },
        dataType: 'json',
        headers: { "token": token },
        success: function() {
            //Si se elimina correctamente la quitamos de la tabla
            $( "#"+id).remove();
        },
        error : function (error){
            //Si hay un error nos desconectamos
            desconectar();
            $("p").remove(".alert-danger");
            //Mostramos el error correspondiente

            if(error.status===403)
                errorMostrar="Error eliminando conversaciones, posiblemente su sesión este caducada";
            else
                errorMostrar=error.responseJSON.error;
        }
    });
}

//Función que actualiza los mensajes sin leer
function actualizarMensajesSinLeer(id){
    //Obtenemos todos los mensajes de la conversación
    $.ajax({
        url: URLbase + "/mensajes/" + id,
        type: "GET",
        data: { },
        dataType: 'json',
        headers: { "token": token },
        success: function(result) {
            //Para cada mensaje comprobamos si esá leído, si no lo está sumamos uno a la variable
            let mensajesSinLeer=0
            for(let i = 0 ; i <result.length;i++){
                if(!result[i].leido && result[i].autor !== Cookies.get('email')){
                    mensajesSinLeer++;
                }
            }
            //Actualizamos el valor en la tabla
            $( "#numeroDeMensajesSinLeer"+id).html(""+mensajesSinLeer);
            //Volvemos a llamar a la función para actualizar constantemente los mensajes no léidos
            if( new URL(window.location.href).searchParams.get("w")=== "conversationList")
                actualizarMensajesSinLeer(id);
        },
        error : function (error){


            if(error.status===403){
                desconectar();
                errorMostrar="Error actualizando mensajes, posiblemente su sesión este caducada";
            }


        }
    });
}

//Si intentamos acceder sin estar logeados volvemos al login
if ( Cookies.get('token') === null ) {
    $("#contenedor-principal").load("widget-login.html");
}
else {
    //Si estamos logeados cargamos las conversaciones
    cargarConversaciones();
}