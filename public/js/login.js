$("#boton-login").click(function (){

    $.ajax({
        url:URLbase+ "/autenticar",
        type:"POST",
        data:{
            email: $("#email").val(),
            password: $("#password").val()
        },

        dataType:'json',
        success:function (respuesta){

            console.log(respuesta.token);
            token=respuesta.token;
            Cookies.set('token', respuesta.token);
            Cookies.set('email', $("#email").val());
            $("#contenedor-principal").load("widget-ofertas.html");
            updateNav();

        },

        error:function (error,response){
            $("p").remove(".alert-danger");
            Cookies.remove('token');
            $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");

        },



    });


});


if ( Cookies.get('token') != null ) {
    $("#contenedor-principal").load("widget-ofertas.html");

}