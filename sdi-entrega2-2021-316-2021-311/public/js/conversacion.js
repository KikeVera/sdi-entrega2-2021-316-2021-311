 idOfertaSeleccionada=Cookies.get('idOferta');




if(Cookies.get('token') == null){
    $( "#contenedor-principal" ).load("widget-login.html");
}

else if( idOfertaSeleccionada==null){
    $( "#contenedor-principal" ).load("widget-ofertas.html");
}

else {


    function getConversacion() {
        $.ajax({
            url: URLbase + "/conversaciones/" + idOfertaSeleccionada,
            type: "GET",
            headers: {"token": token},
            dataType: 'json',
            success: function (respuesta) {
                if(respuesta.interesado.length>0) {
                    idConversacion=respuesta.interesado[0]._id;
                    getMensajes();
                }
                else if(respuesta.propietario.length>0) {
                    idConversacion=respuesta.propietario[0]._id;
                    getMensajes();
                }
                else {
                    getConversacion();
                }

            },
            error: function (error) {
                desconectar();
                $("p").remove(".alert-danger");


                if(error.status===403)
                    $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
                else
                    $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");


            },


        });
    }

    getConversacion();



    function getMensajes() {


        let conversacion="";

        $.ajax({
            url: URLbase + "/mensajes/"+idConversacion,
            type: "GET",
            headers: {"token": token},
            dataType: 'json',
            success: function (respuesta) {

                for(let i=0;i<respuesta.length;i++){

                    if( Cookies.get('email')===respuesta[i].autor){
                        if(!respuesta[i].leido) {
                            conversacion = conversacion + "<p class=\"propios\">" + respuesta[i].texto + "<span class='noleido'> ✔</span></p> \n";
                        }
                        else
                            conversacion = conversacion + "<p class=\"propios\">" + respuesta[i].texto + "<span class='leido'> ✔✔</span></p> \n";
                    }

                    else {

                        if(!respuesta[i].leido) {
                            conversacion = conversacion + "<p class=\"ajenos\">" + respuesta[i].texto + "<span class='noleido'> ✔</span></p> \n";
                            leeMensaje(respuesta[i]._id);
                        }
                        else
                            conversacion = conversacion + "<p class=\"ajenos\">" + respuesta[i].texto + "<span class='leido'> ✔✔</span></p> \n";

                    }

                }


                $("#mensajes").html(conversacion);
                getMensajes();


            },

            error: function (error) {
                desconectar();
                $("p").remove(".alert-danger");

                if(error.status===403)
                    $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
                else
                    $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");

            },


        });
    }

    function leeMensaje(idMensaje) {


        $.ajax({
            url: URLbase + "/mensajes/leer/"+idMensaje,
            type: "PUT",
            headers: {"token": token},
            dataType: 'json',
            success: function (respuesta) {

                console.log(respuesta);


            },

            error: function (error) {
                desconectar();
                $("p").remove(".alert-danger");

                if(error.status===403)
                    $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
                else
                    $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");

            },


        });
    }




    $("#boton-send-message").click(function () {

        let urlConcreta="/"+idOfertaSeleccionada;

        if(idConversacion!==undefined){
            urlConcreta=urlConcreta+"/"+idConversacion;

         }
        console.log(URLbase + "/mensajes/enviar"+urlConcreta);
        $.ajax({
            url: URLbase + "/mensajes/enviar"+urlConcreta,
            type: "POST",
            data: {
                texto: $("#message").val()

            },
            headers: {"token": token},
            dataType: 'json',
            success: function (respuesta) {

                console.log(respuesta);


            },

            error: function (error) {
                desconectar();
                $("p").remove(".alert-danger");

                if(error.status===403)
                    $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones, posiblemente su sesión este caducada</p>");
                else
                    $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");

            },


        });


    });


}


