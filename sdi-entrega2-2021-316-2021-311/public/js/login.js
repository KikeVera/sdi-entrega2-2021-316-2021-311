
//Función de autenticarse asociada al bo´ton
$("#boton-login").click(function (){

    $.ajax({
        url:URLbase+ "/autenticar",
        type:"POST",
        data:{
            //Le pasamos en el cuerpo el email y el password
            email: $("#email").val(),
            password: $("#password").val()
        },

        dataType:'json',
        success:function (respuesta){

           //Si el usuario se autentica correctamente  se guarda en token recibido en la variable y en la cookie
            token=respuesta.token;
            Cookies.set('token', respuesta.token);
            //Guardamos en las cookies también el email del usuario para usarlo mas adelante
            Cookies.set('email', $("#email").val());

            //Se redirige el usuario a las oferta s y se actualiza la barra de navegación
            $("#contenedor-principal").load("widget-ofertas.html");
            updateNav();

        },

        error:function (error){
            //Si hay un error en el login se muestra el mensaje de error
            $("p").remove(".alert-danger");
            Cookies.remove('token');
            $("#widget-login").prepend("<p class='alert alert-danger'>"+error.responseJSON.error+"</p>");

        },



    });


});

//Si se intenta acceder al login estand ya logeados se redirige a las ofertas
if ( Cookies.get('token') != null ) {
    $("#contenedor-principal").load("widget-ofertas.html");

}