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
                console.log(idOfertaSeleccionada);
                console.log(respuesta)
                if(respuesta.interesado.length>0) {
                    idConversacion=respuesta.interesado[0]._id;
                    console.log(idConversacion);
                    getMensajes();
                }
                else {
                    getConversacion();
                }

            },
            error: function (error) {
                $("p").remove(".alert-danger");

                $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones</p>");

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

                    if( Cookies.get('email')===respuesta[i].autor)
                         conversacion=conversacion+"<p class=\"propios\">"+respuesta[i].texto+"</p> \n";
                    else {

                        if(!respuesta[i].leido) {
                            conversacion = conversacion + "<p class=\"ajenos\">" + respuesta[i].texto + "</p> \n";
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
                $("p").remove(".alert-danger");

                $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo mensajes</p>");

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
                $("p").remove(".alert-danger");

                $("#widget-login").prepend("<p class='alert alert-danger'>Error leyendo mensaje</p>");

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
                $("p").remove(".alert-danger");

                $("#widget-login").prepend("<p class='alert alert-danger'>No se ha podido insertar el mensaje</p>");

            },


        });


    });


}


