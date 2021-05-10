 //Asignamos a la variable el valor que tenemos en las cookies
idOfertaSeleccionada=Cookies.get('idOferta');

//Si intentamos venir aquí deslogeados volvemos al login
if(Cookies.get('token') == null){
    $( "#contenedor-principal" ).load("widget-login.html");
}

//Si no hay ninguna oferta en la variable volvemos a ofertas
else if( idOfertaSeleccionada==null){
    $( "#contenedor-principal" ).load("widget-ofertas.html");
}

else {

    //Función para obtener la conversación de la oferta
    function getConversacion() {
        $.ajax({
            url: URLbase + "/conversaciones/" + idOfertaSeleccionada,
            type: "GET",
            headers: {"token": token},
            dataType: 'json',
            success: function (respuesta) {
                //Si conseguimos obtener la conversación del usuario en esta oferta vamos a la funcíón que obtiene los mensajes
                if(respuesta.interesado.length>0) {
                    idConversacion=respuesta.interesado[0]._id;
                    getMensajes();
                }
                else if(respuesta.propietario.length>0) {
                    idConversacion=respuesta.propietario[0]._id;
                    getMensajes();
                }
                //Si no podemos obtener la conversación lo intentamos otra vez hasta que se pueda obtener
                else {
                    getConversacion();
                }

            },
            error: function (error) {
                //Si hay un error nos desconectamos
                desconectar();
                $("p").remove(".alert-danger");
                //Mostramos el error correspondiente
                if(error.status===403)
                    $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
                else
                    $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");


            },


        });
    }

    //Llamamos a la función getConversación automaticamente
    getConversacion();


    //Función para obtener los mensajes
    function getMensajes() {

        //Iniciamos variable  donde se guarda´ran
        let conversacion="";

        $.ajax({
            url: URLbase + "/mensajes/"+idConversacion,
            type: "GET",
            headers: {"token": token},
            dataType: 'json',
            success: function (respuesta) {
                //Se recorren todos los mensajes de la respuesta
                for(let i=0;i<respuesta.length;i++){
                    //Si los mensajes son nuestros tendrán un formato y si lo son tendrán otro
                    if( Cookies.get('email')===respuesta[i].autor){
                        //Se comprueba si el mensaje está leído para mostrarlo como tal
                        if(!respuesta[i].leido) {
                            conversacion = conversacion + "<p class=\"propios\">" + respuesta[i].texto + "<span class='noleido'> ✔</span></p> \n";
                        }
                        else
                            conversacion = conversacion + "<p class=\"propios\">" + respuesta[i].texto + "<span class='leido'> ✔✔</span></p> \n";
                    }

                    else {

                        if(!respuesta[i].leido) {
                            conversacion = conversacion + "<p class=\"ajenos\">" + respuesta[i].texto + "<span class='noleido'> ✔</span></p> \n";
                            //Si un mensaje no está leído y es un mensaje ajeno se leerá dicho mensaje
                            leeMensaje(respuesta[i]._id);
                        }
                        else
                            conversacion = conversacion + "<p class=\"ajenos\">" + respuesta[i].texto + "<span class='leido'> ✔✔</span></p> \n";

                    }

                }

                //Se muestra en pantalla los mensajes
                $("#mensajes").html(conversacion);
                //Se llama de nuevo a la función para ir actualizando los nuevos mensajes
                getMensajes();


            },

            error: function (error) {
                //Si hay un error nos desconectamos
                desconectar();
                $("p").remove(".alert-danger");
                //Mostramos el error correspondiente

                if(error.status===403)
                    $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
                else
                    $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");

            },


        });
    }

    //Función para ller un mensaje
    function leeMensaje(idMensaje) {


        $.ajax({
            url: URLbase + "/mensajes/leer/"+idMensaje,
            type: "PUT",
            headers: {"token": token},
            dataType: 'json',
            success: function (respuesta) {


            },

            error: function (error) {
                //Si hay un error nos desconectamos
                desconectar();
                $("p").remove(".alert-danger");
                //Mostramos el error correspondiente

                if(error.status===403)
                    $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
                else
                    $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");

            },


        });
    }



    //Función para enviar un mensaje asociada al botón
    $("#boton-send-message").click(function () {

        //La url al enviar un mensaje dependerá de si ya existe una conversación
        let urlConcreta="/"+idOfertaSeleccionada;

        //Si existe la conversación la añadimos a la url
        if(idConversacion!==undefined){
            urlConcreta=urlConcreta+"/"+idConversacion;

         }

        $.ajax({
            url: URLbase + "/mensajes/enviar"+urlConcreta,
            type: "POST",
            data: {
                //Enviamos en el cuerpo lo que esté escrito
                texto: $("#message").val()

            },
            headers: {"token": token},
            dataType: 'json',
            success: function (respuesta) {




            },

            error: function (error) {
                //Si hay un error nos desconectamos
                desconectar();
                $("p").remove(".alert-danger");
                //Mostramos el error correspondiente

                if(error.status===403)
                    $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
                else
                    $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");

            },


        });


    });


}

