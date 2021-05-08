let idOfertaSeleccionada=Cookies.get('idOferta');



if(Cookies.get('token') == null){
    $( "#contenedor-principal" ).load("widget-login.html");
}

else if( idOfertaSeleccionada==null){
    $( "#contenedor-principal" ).load("widget-ofertas.html");
}

else {
    let idConversacion;
    function getConversacion() {
        $.ajax({
            url: URLbase + "/conversaciones/" + idOfertaSeleccionada,
            type: "GET",
            headers: {"token": token},
            dataType: 'json',
            success: function (respuesta) {
                console.log(respuesta);
                if(respuesta.interesado.length>0) {
                    idConversacion=respuesta.interesado[0]._id;
                    console.log(idConversacion);
                }

                getConversacion();

            },
            error: function (error) {
                $("p").remove(".alert-danger");

                $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo conversaciones</p>");

            },


        });
    }

    getConversacion();


/*
    function getMensajes() {

        while(idConversacion===undefined){
            $("#mensajes").html("<p>No hay una conversación para esta oferta todavía</p>");

        }
        $("#mensajes").empty();

        $.ajax({
            url: URLbase + "/mensajes/"+idConversacion,
            type: "GET",
            headers: {"token": token},
            dataType: 'json',
            success: function (respuesta) {
                console.log(respuesta);
                for(let element in respuesta){
                    $("#mensajes").append("<p>"+element.texto+"</p>");
                }

                getConversacion();


            },

            error: function (error) {
                $("p").remove(".alert-danger");

                $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo mensajes</p>");

            },


        });
    }

    getMensajes();
*/

    $("#boton-send-message").click(function () {

        let urlConcreta="/"+idOfertaSeleccionada;

        if(idConversacion!==undefined){
            urlConcreta=urlConcreta+"/"+idConversacion;

         }
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


