 idOfertaSeleccionada=Cookies.get('idOferta');



if(Cookies.get('token') == null){
    $( "#contenedor-principal" ).load("widget-login.html");
}

else if( idOfertaSeleccionada==null){
    $( "#contenedor-principal" ).load("widget-ofertas.html");
}

else {
    $("#mensajes").html("<p>No hay una conversación para esta oferta todavía</p>");

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


        $("#mensajes").empty();

        $.ajax({
            url: URLbase + "/mensajes/"+idConversacion,
            type: "GET",
            headers: {"token": token},
            dataType: 'json',
            success: function (respuesta) {
                console.log(respuesta[0].texto);
                for(let i=0;i<respuesta.length;i++){

                    $("#mensajes").append("<p>"+respuesta[0].texto+"</p>");
                }

                getMensajes();


            },

            error: function (error) {
                $("p").remove(".alert-danger");

                $("#widget-login").prepend("<p class='alert alert-danger'>Error obteniendo mensajes</p>");

            },


        });
    }




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


