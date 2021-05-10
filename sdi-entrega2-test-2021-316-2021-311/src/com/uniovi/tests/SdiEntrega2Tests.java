package com.uniovi.tests;
import static org.junit.Assert.assertTrue;

//Paquetes Java
import java.util.List;

import org.bson.Document;
//Paquetes JUnit 
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
//Paquetes Selenium 
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.PO_HomeView;
import com.uniovi.tests.pageobjects.PO_LoginView;
import com.uniovi.tests.pageobjects.PO_MongoServer;
import com.uniovi.tests.pageobjects.PO_NavView;
import com.uniovi.tests.pageobjects.PO_NewSaleView;
import com.uniovi.tests.pageobjects.PO_Properties;
import com.uniovi.tests.pageobjects.PO_RegisterView;
import com.uniovi.tests.pageobjects.PO_SalesView;
import com.uniovi.tests.pageobjects.PO_View;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;


//Ordenamos las pruebas por el nombre del método
@FixMethodOrder(MethodSorters.NAME_ASCENDING) 
public class SdiEntrega2Tests {
	//En Windows (Debe ser la versión 65.0.1 y desactivar las actualizacioens automáticas)):
	//static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	//static String Geckdriver024 = "C:\\Path\\geckodriver024win64.exe";
	//En MACOSX (Debe ser la versión 65.0.1 y desactivar las actualizacioens automáticas):
	//Adolfo
	//static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	//static String Geckdriver024 = "C:\\Carpetas\\Clase2\\SDI\\PL-SDI-Sesión5-material\\geckodriver024win64.exe";
	//Kike
	 static String PathFirefox65="C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024="C:\\Users\\Kike\\Desktop\\SDI\\geckoDriver\\geckodriver024win64.exe";
	//static String PathFirefox64 = "/Applications/Firefox.app/Contents/MacOS/firefox-bin";
	//static String Geckdriver024 = "/Users/delacal/Documents/SDI1718/firefox/geckodriver024mac";
	//static String Geckdriver022 = "/Users/delacal/Documents/SDI1718/firefox/geckodriver023mac";
	//Común a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024); 
	static String URL = "https://localhost:8081";

	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}


	@Before
	public void setUp(){
		driver.navigate().to(URL);
		//Eliminamos los datos introducidos para el test
		PO_MongoServer.removeInitialiceData();
		//Introducimos unos datos base para la realizacion del test en la base de datos
		PO_MongoServer.initialice();
	}
	@After
	public void tearDown(){
		driver.manage().deleteAllCookies();
	}
	
	@BeforeClass 
	static public void begin() {
		//COnfiguramos las pruebas.
		//Fijamos el timeout en cada opción de carga de una vista. 2 segundos.
		PO_View.setTimeout(3);

	}
	@AfterClass
	static public void end() {
		//Cerramos el navegador al finalizar las pruebas
		driver.quit();
		PO_MongoServer.removeInitialiceData();
	}

	//[Prueba1] Registro de Usuario con datos válidos. 
	@Test
	public void PR01() {
		// Vamos al formulario de registro
		PO_NavView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		//Comprobamos que estamos en la vista de registro
		SeleniumUtils.textoPresentePagina(driver,"Registrar usuario");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "emailParaTest@gmail.com", "Usuario", "Test", "123456", "123456");
		// Que nos redirige a la vista de identificacion y nos muestra un mensaje de usuario logeado
		PO_View.checkKey(driver,"usuarioAutenticado.message" , PO_Properties.getSPANISH());
		SeleniumUtils.textoPresentePagina(driver,"Identificación de usuario");
		// Comprobamos que se guardo correctamente en la base de datos
		boolean inDataBase = PO_MongoServer.userInDataBase("emailParaTest@gmail.com");
		Assert.assertTrue(inDataBase);
	}

	//PR02. Registro de Usuario con datos inválidos (email, nombre y apellidos vacíos). 
	@Test
	public void PR02() {
		// Vamos al formulario de registro
		PO_NavView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "", "", "", "123456", "123456");
		//Comprobamos que seguimos en la vista de registro
		SeleniumUtils.textoPresentePagina(driver,"Registrar usuario");
		// Comprobamos que nos salen los avisos de campos vacios
		PO_RegisterView.checkKey(driver, "usuarioAutenticado.error.emptyEmail", PO_Properties.getSPANISH());	
		PO_RegisterView.checkKey(driver, "usuarioAutenticado.error.emptyName", PO_Properties.getSPANISH());
		PO_RegisterView.checkKey(driver, "usuarioAutenticado.error.emptySurname", PO_Properties.getSPANISH());
	}

	//PR03. Registro de Usuario con datos inválidos (repetición de contraseña inválida). 
	@Test
	public void PR03() {
		// Vamos al formulario de registro
		PO_NavView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "emailParaTest@gmail.com", "Usuario", "Test", "123", "123456");
		//Comprobamos que seguimos en la vista de registro
		SeleniumUtils.textoPresentePagina(driver,"Registrar usuario");
		// Comprobamos que nos sale el aviso de repeticion de contraseña incorrecta
		SeleniumUtils.textoPresentePagina(driver,"Las contraseñas no coinciden");
	}
	
	//PR04. Registro de Usuario con datos inválidos (email existente). 
	@Test
	public void PR04() {
		// Vamos al formulario de registro
		PO_NavView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "PacoGonzalez@gmail.com", "Usuario", "Test", "123456", "123456");
		//Comprobamos que seguimos en la vista de registro
		SeleniumUtils.textoPresentePagina(driver,"Registrar usuario");
		// Comprobamos que no sale el aviso de repeticion de contraseña incorrecta
		PO_RegisterView.checkKey(driver, "usuarioAutenticado.error.emailRegistered", PO_Properties.getSPANISH());
	}
	
	//PR05. Inicio de sesión con datos válidos /
	@Test
	public void PR05() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		//Comprobamos estamos en la ventana de log in
		SeleniumUtils.textoPresentePagina(driver,"Identificación de usuario");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");
		// Comprobamos estamos en la pagina principal del usuario estandar
		SeleniumUtils.textoPresentePagina(driver,"Ofertas");
	}
	
	//PR06. Inicio de sesión con datos inválidos (email existente, pero contraseña incorrecta). 
	@Test
	public void PR06() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		//Comprobamos estamos en la ventana de log in
		SeleniumUtils.textoPresentePagina(driver,"Identificación de usuario");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123");
		// Comprobamos estamos en la vista de indentificacion
		SeleniumUtils.textoPresentePagina(driver,"Identificación de usuario");
		// Comprobamos que muestra el mensaje de error
		SeleniumUtils.textoPresentePagina(driver,"Email o constraseña incorrecta");

	}
	
	//PR07. Inicio de sesión con datos inválidos (campo email o contraseña vacíos). 
	@Test
	public void PR07() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		//Comprobamos estamos en la ventana de log in
		SeleniumUtils.textoPresentePagina(driver,"Identificación de usuario");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "", "123");
		// Comprobamos estamos en la vista de indentificacion
		SeleniumUtils.textoPresentePagina(driver,"Identificación de usuario");
		// Comprobamos que muestra el mensaje de error
		SeleniumUtils.textoPresentePagina(driver,"Rellene el campo email para continuar");			
	}	
	
	//PR08. Inicio de sesión con datos inválidos (email no existente en la aplicación). 
	@Test
	public void PR08() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		//Comprobamos estamos en la ventana de log in
		SeleniumUtils.textoPresentePagina(driver,"Identificación de usuario");
		// Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "pedro@estoesuntest.com", "123");
		// Comprobamos estamos en la vista de indentificacion
		SeleniumUtils.textoPresentePagina(driver,"Identificación de usuario");
		// Comprobamos que muestra el mensaje de error
		SeleniumUtils.textoPresentePagina(driver,"Email o constraseña incorrecta");	
	}	
	
	//PR09. Hacer click en la opción de salir de sesión y comprobar que se redirige a la página de
	//inicio de sesión (Login).
	@Test
	public void PR09() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos logeamos.
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
		// Comprobamos estamos en la pagina principal del usuario estandar
		SeleniumUtils.textoPresentePagina(driver,"Ofertas");
		// Nos desconectamos
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		//Comprobamos que estamos en la vista de login
		SeleniumUtils.textoPresentePagina(driver,"Identificación de usuario");
		
	}	
	//PR10. Comprobar que el botón cerrar sesión no está visible si el usuario no está autenticado.
	@Test
	public void PR10() {
		PO_View.checkNotElement(driver, "desconectarse");
		SeleniumUtils.textoNoPresentePagina(driver,"Desconectarse");
	}	
	
	//PR11. Mostrar el listado de usuarios y comprobar que se muestran todos los que existen en el sistema. /
	@Test
	public void PR11() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos logeamos.
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		// Comprobamos estamos en la pagina principal del usuario administrador
		SeleniumUtils.textoPresentePagina(driver,"Usuarios en la aplicacion");	
		// Comprobamos que aparecen todos los usuarios cargados en la base de datos
		PO_View.checkElement(driver, "text", "PacoGonzalez@gmail.com");
		PO_View.checkElement(driver, "text", "MariaDelagado@gmail.com");
		PO_View.checkElement(driver, "text", "RaulSuarez@gmail.com");
		PO_View.checkElement(driver, "text", "EmilioFernandez@gmail.com");
		PO_View.checkElement(driver, "text", "SaraOrtiz@gmail.com");
		PO_View.checkElement(driver, "text", "SalomonParedes@gmail.com");	
	}	
	
	//PR12. Ir a la lista de usuarios, borrar el primer usuario de la lista, comprobar que la lista se actualiza y dicho usuario desaparece 
	@Test
	public void PR12() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos logeamos.
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		// Comprobamos estamos en la pagina principal del usuario administrador
		SeleniumUtils.textoPresentePagina(driver,"Usuarios en la aplicacion");
		
		//Se comprueba que existe en la lista el usuario a eliminar
		PO_View.checkElement(driver, "text", "PacoGonzalez@gmail.com");
		
		//Obtenemos la lista de elementos TODO
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div[2]/form/table/tbody/tr", PO_View.getTimeout());
		for (int i = 0;i<elementos.size();i++) {
			WebElement elemento = elementos.get(i).findElement(By.id("email"));
			String email = elemento.getText();
			if(email.equals("PacoGonzalez@gmail.com")) {
				WebElement checkbox =  elementos.get(i).findElement(By.id("checkBox")).findElement(By.name("checkboxUser"));
				checkbox.click();
				break;
			}
		}
		//Eliminamos el usuario
		By boton = By.className("btn");
		driver.findElement(boton).click();
		//Se comprueba que ya no aparece en la lista
		PO_View.checkNotElement(driver, "PacoGonzalez@gmail.com");
		
	}	
	
	//PR13. Ir a la lista de usuarios, borrar el último usuario de la lista, comprobar que la lista se
	//actualiza y dicho usuario desaparece 
	@Test
	public void PR13() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos logeamos.
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		// Comprobamos estamos en la pagina principal del usuario administrador
		SeleniumUtils.textoPresentePagina(driver,"Usuarios en la aplicacion");
		
		//Usuario a eliminar
		String user = "";
		
		//Obtenemos la lista de elementos
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div[2]/form/table/tbody/tr", PO_View.getTimeout());
		//Obtenemos el ultimo usuario de la lista
		WebElement elemento = elementos.get(elementos.size()-1).findElement(By.id("email"));
		user = elemento.getText();
		//Obtenemos su checkbox y la clicamos
		WebElement checkbox =  elementos.get(elementos.size()-1).findElement(By.id("checkBox")).findElement(By.name("checkboxUser"));
		checkbox.click();
		//Eliminamos el usuario
		By boton = By.className("btn");
		driver.findElement(boton).click();
		//Se comprueba que ya no aparece en la lista
		PO_View.checkNotElement(driver, user);
	}	
	
	//PR14. Ir a la lista de usuarios, borrar 3 usuarios, comprobar que la lista se actualiza y dichos
	//usuarios desaparecen. 
	@Test
	public void PR14() {
		// Vamos al formulario de inicio de sesion
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Nos logeamos.
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		// Comprobamos estamos en la pagina principal del usuario administrador
		SeleniumUtils.textoPresentePagina(driver,"Usuarios en la aplicacion");
		
		//Usuarios a eliminar
		String user1 = "";
		String user2 = "";
		String user3 = "";
		
		//Obtenemos la lista de elementos
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div[2]/form/table/tbody/tr", PO_View.getTimeout());
		//Obtenemos los usurios de la lista
		WebElement elemento = elementos.get(elementos.size()-1).findElement(By.id("email"));
		user1 = elemento.getText();
		elemento = elementos.get(elementos.size()-2).findElement(By.id("email"));
		user2 = elemento.getText();
		elemento = elementos.get(elementos.size()-3).findElement(By.id("email"));
		user3 = elemento.getText();
		//Obtenemos sus checkboxs y las clicamos
		WebElement checkbox =  elementos.get(elementos.size()-1).findElement(By.id("checkBox")).findElement(By.name("checkboxUser"));
		checkbox.click();
		checkbox =  elementos.get(elementos.size()-2).findElement(By.id("checkBox")).findElement(By.name("checkboxUser"));
		checkbox.click();
		checkbox =  elementos.get(elementos.size()-3).findElement(By.id("checkBox")).findElement(By.name("checkboxUser"));
		checkbox.click();
		//Eliminamos los usuarios
		By boton = By.className("btn");
		driver.findElement(boton).click();
		//Se comprueba que ya no aparecen en la lista
		PO_View.checkNotElement(driver, user1);			
		PO_View.checkNotElement(driver, user2);			
		PO_View.checkNotElement(driver, user3);			
	}	
	
	//PR15. Ir al formulario de alta de oferta, rellenarla con datos válidos y pulsar el botón Submit.
	//Comprobar que la oferta sale en el listado de ofertas de dicho usuario.
	@Test
	public void PR15() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
		
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();
		//Nos dirigimos a agregar una oferta
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'ofertas/agregar')]");
		elementos.get(0).click();
		//Rellenamos el formulario con datos validos
		PO_NewSaleView.fillForm(driver, "OfertaTest", "Test", "12");
		
		//Comprobamos que se nos redirigio a las ofertas del usuario
		SeleniumUtils.textoPresentePagina(driver,"Mis ofertas");
		
		//Comprobamos que aparece la oferta que acabamos de crear
		SeleniumUtils.textoPresentePagina(driver,"OfertaTest");
	}	
	
	//PR16. Ir al formulario de alta de oferta, rellenarla con datos inválidos (campo título vacío y
	//precio en negativo) y pulsar el botón Submit. Comprobar que se muestra el mensaje de campo
	//obligatorio.

	@Test
	public void PR16() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
				
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();
		//Nos dirigimos a agregar una oferta
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'ofertas/agregar')]");
		elementos.get(0).click();
		//Rellenamos el formulario con datos inválidos
		PO_NewSaleView.fillForm(driver, " ", " ", "-12");
		
		//Comprobamos que se nos redirigio a la misma pagina
		SeleniumUtils.textoPresentePagina(driver,"Agregar canción");
		
		//Comprobamos los errores
		PO_View.checkElement(driver, "text", "Error debe rellenar el campo de titulo");	
		PO_View.checkElement(driver, "text", "Error debe rellenar el campo de detalles");	
		PO_View.checkElement(driver, "text", "El precio no puede ser negativo");	
		
	}	
	
	//PR017. Mostrar el listado de ofertas para dicho usuario y comprobar que se muestran todas las
	//que existen para este usuario 
	@Test
	public void PR17() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
				
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();
		//Nos dirigimos a agregar una oferta
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'ofertas/propias')]");
		elementos.get(0).click();
		//Comprobamos que se nos redirigio a las ofertas del usuario
		SeleniumUtils.textoPresentePagina(driver,"Mis ofertas");
		
		//Comprobamos que aparecen las ofertas del usuario
		SeleniumUtils.textoPresentePagina(driver,"OfertaTest1");
		SeleniumUtils.textoPresentePagina(driver,"OfertaTest2");
		SeleniumUtils.textoPresentePagina(driver,"OfertaTest3");			
	}	
	
	//PR18. Ir a la lista de ofertas, borrar la primera oferta de la lista, comprobar que la lista se
	//actualiza y que la oferta desaparece 
	@Test
	public void PR18() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
				
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();
		//Nos dirigimos a agregar una oferta
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'ofertas/propias')]");
		elementos.get(0).click();
		//Comprobamos que se nos redirigio a las ofertas del usuario
		SeleniumUtils.textoPresentePagina(driver,"Mis ofertas");
		//Eliminamos la primera oferta
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div[2]/table/tbody/tr", PO_View.getTimeout());
		String oferta = elementos.get(0).findElement(By.id("titulo")).getText();
		//Comprobamos que aparece la oferta
		SeleniumUtils.textoPresentePagina(driver,oferta);
		WebElement elemento = elementos.get(0).findElement(By.id("eliminarRef")).findElement(By.id("eliminar"));
		elemento.click();
		//Comprobamos que ya no aparece la oferta borrada
		SeleniumUtils.textoNoPresentePagina(driver,oferta);
	}	
	
	//PR19. Ir a la lista de ofertas, borrar la última oferta de la lista, comprobar que la lista se actualiza
	//y que la oferta desaparece. /
	@Test
	public void PR19() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
				
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();
		//Nos dirigimos a agregar una oferta
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'ofertas/propias')]");
		elementos.get(0).click();
		//Comprobamos que se nos redirigio a las ofertas del usuario
		SeleniumUtils.textoPresentePagina(driver,"Mis ofertas");
		//Eliminamos la ultima oferta
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div[2]/table/tbody/tr", PO_View.getTimeout());
		String oferta = elementos.get(elementos.size()-1).findElement(By.id("titulo")).getText();
		//Comprobamos que aparece la oferta
		SeleniumUtils.textoPresentePagina(driver,oferta);
		WebElement elemento = elementos.get(elementos.size()-1).findElement(By.id("eliminarRef")).findElement(By.id("eliminar"));
		elemento.click();
		//Comprobamos que ya no aparece la oferta borrada
		SeleniumUtils.textoNoPresentePagina(driver,oferta);		
	}	
	
	//P20. Hacer una búsqueda con el campo vacío y comprobar que se muestra la página que
	//corresponde con el listado de las ofertas existentes en el sistema 
	@Test
	public void PR20() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
		
		//Comprobamos que estamos en el listado de ofertas
		SeleniumUtils.textoPresentePagina(driver,"Ofertas");
		//Buscamos con el campo vacio
		PO_SalesView.search(driver, "");
		
		//Obtenemos las ofertas
		List<Document> sales = PO_MongoServer.getAllSales();
		//Buscamos cada oferta en la lista de ofertas
		for (Document document : sales) {
			if(!document.getString("vendedor").equals("PacoGonzalez@gmail.com")) {
				PO_SalesView.buscarEnPaginaPorTitulo(driver, document.getString("titulo"));
				PO_View.checkElement(driver, "free", "//td[contains(text(), '"+document.getString("titulo")+"')]");
			}
		}
	}	
	
	//PR21. Hacer una búsqueda escribiendo en el campo un texto que no exista y comprobar que se
	//muestra la página que corresponde, con la lista de ofertas vacía.
	@Test
	public void PR21() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
		
		//Comprobamos que estamos en el listado de ofertas
		SeleniumUtils.textoPresentePagina(driver,"Ofertas");
		//Buscamos con el campo vacio
		PO_SalesView.search(driver, "OfertaInexistente");
		
		//Comprobamos que no existen ofertas
		PO_View.checkNotElement(driver, "/html/body/div/div[3]/div/table/tbody/tr");
				
	}	
	
	//PR22. Hacer una búsqueda escribiendo en el campo un texto en minúscula o mayúscula y
	//comprobar que se muestra la página que corresponde, con la lista de ofertas que contengan
	//dicho texto, independientemente que el título esté almacenado en minúsculas o mayúscula.
	@Test
	public void PR22() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
		
		//Comprobamos que estamos en el listado de ofertas
		SeleniumUtils.textoPresentePagina(driver,"Ofertas");
		//Buscamos con el campo vacio
		PO_SalesView.search(driver, "ofertaabuscar");
		
		//Comprobamos que no existen ofertas
		List<WebElement> elements = PO_View.checkElement(driver, "free","/html/body/div/div[3]/div/table/tbody/tr");
		//Comprobamos que nos devolvio solo una fila
		Assert.assertTrue(elements.size()==1);
	}	
	
	//PR23. Sobre una búsqueda determinada (a elección de desarrollador), comprar una oferta que
	//deja un saldo positivo en el contador del comprobador. Y comprobar que el contador se
	//actualiza correctamente en la vista del comprador.
	@Test
	public void PR23() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
		
		//Obtenemos el dinero actual del usuario
		int dineroEsperado = (int) PO_MongoServer.getUserByEmail("PacoGonzalez@gmail.com").get("dinero");
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();	
		
		//Realizamos una busqueda de la OfertaTest6 que cuesta 6 euros
		PO_SalesView.search(driver, "OfertaTest6");
		
		//Compramos la oferta
		elementos = PO_View.checkElement(driver, "free", "//td[contains(text(), 'OfertaTest6')]/following-sibling::*/a[contains(@href, 'ofertas/comprar')]");
		elementos.get(0).click();
		
		//Comprobamos que se realizo la compra
		SeleniumUtils.textoPresentePagina(driver,"Compra realizada con exito");
		
		//Se actualizo el saldo del usuario
		dineroEsperado = dineroEsperado-6;
		int dineroActual = (int) PO_MongoServer.getUserByEmail("PacoGonzalez@gmail.com").get("dinero");
		Assert.assertTrue(dineroEsperado==dineroActual);
		
		//Comprobar que se actualizo el contador de la vista
		Assert.assertTrue(driver.findElement(By.id("userMoney")).getText().equals("Saldo : "+dineroEsperado+ " €"));
		
							
	}	
	
	//PR24.  Sobre una búsqueda determinada (a elección de desarrollador), comprar una oferta que
	//deja un saldo 0 en el contador del comprobador. Y comprobar que el contador se actualiza
	//correctamente en la vista del comprador. 
	@Test
	public void PR24() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
		
		//Obtenemos el dinero actual del usuario
		int dineroEsperado = (int) PO_MongoServer.getUserByEmail("PacoGonzalez@gmail.com").get("dinero");
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();	
		
		//Realizamos una busqueda de la OfertaTestCoste100 que cuesta 100 euros como el dinero inicial de Paco
		PO_SalesView.search(driver, "OfertaTestCoste100");
		
		//Compramos la oferta
		elementos = PO_View.checkElement(driver, "free", "//td[contains(text(), 'OfertaTestCoste100')]/following-sibling::*/a[contains(@href, 'ofertas/comprar')]");
		elementos.get(0).click();
		
		//Comprobamos que se realizo la compra
		SeleniumUtils.textoPresentePagina(driver,"Compra realizada con exito");
		
		//Se actualizo el saldo del usuario
		dineroEsperado = dineroEsperado-100;
		int dineroActual = (int) PO_MongoServer.getUserByEmail("PacoGonzalez@gmail.com").get("dinero");
		Assert.assertTrue(dineroEsperado==dineroActual);
		
		//Comprobar que se actualizo el contador de la vista
		Assert.assertTrue(driver.findElement(By.id("userMoney")).getText().equals("Saldo : "+dineroEsperado+ " €"));			
	}	
	//PR25. Sobre una búsqueda determinada (a elección de desarrollador), intentar comprar una
	//oferta que esté por encima de saldo disponible del comprador. Y comprobar que se muestra el
	//mensaje de saldo no suficiente.
	@Test
	public void PR25() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
		
		//Obtenemos el dinero actual del usuario
		int dineroEsperado = (int) PO_MongoServer.getUserByEmail("PacoGonzalez@gmail.com").get("dinero");
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();	
		
		//Realizamos una busqueda de la OfertaTest4 que cuesta 101 euros, 1 euro mas del saldo del usuario
		PO_SalesView.search(driver, "OfertaTest4");
		
		//Compramos la oferta
		elementos = PO_View.checkElement(driver, "free", "//td[contains(text(), 'OfertaTest4')]/following-sibling::*/a[contains(@href, 'ofertas/comprar')]");
		elementos.get(0).click();
		
		//Comprobamos que muestra el aviso de saldo insuficiente
		SeleniumUtils.textoPresentePagina(driver,"No tienes suficiente dinero para realizar la compra");
		
		//Comprobamos que el saldo del usaurio es el mismo
		int dineroActual = (int) PO_MongoServer.getUserByEmail("PacoGonzalez@gmail.com").get("dinero");
		Assert.assertTrue(dineroEsperado==dineroActual);
		
		//Comprobar que se actualizo el contador de la vista
		Assert.assertTrue(driver.findElement(By.id("userMoney")).getText().equals("Saldo : "+dineroEsperado+ " €"));				
	}
	
	//PR26. Ir a la opción de ofertas compradas del usuario y mostrar la lista. Comprobar que
	//aparecen las ofertas que deben aparecer.
	@Test
	public void PR26() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
				
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();
		//Nos dirigimos a agregar una oferta
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'ofertas/compradas')]");
		elementos.get(0).click();
		//Comprobamos que se nos redirigio a las ofertas compradas del usuario
		SeleniumUtils.textoPresentePagina(driver,"Mis compras");
		//Comprobamos que ya no aparece las 3 ofertas compradas por el usuario
		SeleniumUtils.textoPresentePagina(driver,"OfertaTest5");					
		SeleniumUtils.textoPresentePagina(driver,"OfertaTest7");					
		SeleniumUtils.textoPresentePagina(driver,"OfertaTest8");					
	}	
	
	//PR27. Al crear una oferta marcar dicha oferta como destacada y a continuación comprobar: i)
	//que aparece en el listado de ofertas destacadas para los usuarios y que el saldo del usuario se
	//actualiza adecuadamente en la vista del ofertante (-20).
	@Test
	public void PR27() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
		
		//Obtenemos el dinero actual del usuario
		int dineroEsperado = (int) PO_MongoServer.getUserByEmail("PacoGonzalez@gmail.com").get("dinero");
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();
		
		//Nos dirigimos a agregar una oferta
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'ofertas/agregar')]");
		elementos.get(0).click();		
		
		//Clicamos la opcion de destacar
		elementos = PO_View.checkElement(driver, "free", "//*[@id=\"checkboxOutstanding\"]");
		elementos.get(0).click();
				
		//Rellenamos el formulario con datos validos
		PO_NewSaleView.fillForm(driver, "OfertaDestacadaTest", "Test", "12");
		
		//Comprobamos que se nos redirigio a las ofertas del usuario
		SeleniumUtils.textoPresentePagina(driver,"Mis ofertas");
		
		//Que se actualizo el saldo del usuario
		dineroEsperado = dineroEsperado-20;
		int dineroActual = (int) PO_MongoServer.getUserByEmail("PacoGonzalez@gmail.com").get("dinero");
		Assert.assertTrue(dineroEsperado==dineroActual);
		
		//Nos deslogueamos
		PO_NavView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		
		//Nos logueamos con otra cuenta para poder ver la oferta en la lista de ofertas
		PO_LoginView.fillForm(driver, "MariaDelagado@gmail.com", "123456");	
		
		//Comprobamos que se nos redirigio a la lista de ofertas
		SeleniumUtils.textoPresentePagina(driver,"Ofertas");
		
		
		int pagina=0;
		//Buscamos si el elemento está en la primera página
		elementos = driver.findElements(By.xpath("//*[contains(text(),'OfertaDestacadaTest')]"));
		while(elementos.isEmpty()) {
			//Si no lo está vamos buscando por todas hasta que lo encuentre
			 pagina++;
			 elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '?pg="+pagina+"')]");
			 elementos.get(0).click();
			 elementos = driver.findElements(By.xpath("//td[contains(text(),'OfertaDestacadaTest')]"));
		}
		//Comprobamos que aparece en la tabla
		PO_View.checkElement(driver, "text", "OfertaDestacadaTest");
		//Comprobamos que aparece como destacada en la tabla de ofertas
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div[3]/div/table/tbody/tr", PO_View.getTimeout());
		boolean destacado =false;
		for (int i = 0; i < elementos.size(); i++) {
			if(SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div[3]/div/table/tbody/tr["+(i+1)+"]/td[2]", PO_View.getTimeout()).get(0).getText().equals("OfertaDestacadaTest")) {
				List<WebElement> fila = SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div[3]/div/table/tbody/tr["+(i+1)+"]/td[1]", PO_View.getTimeout());
				Assert.assertTrue(fila.get(0).getText().equals("Destacada"));
				destacado = true;
				break;
			}
		}
		Assert.assertTrue(destacado);
		
	}	
	
	//PR028. Sobre el listado de ofertas de un usuario con más de 20 euros de saldo, pinchar en el
	//enlace Destacada y a continuación comprobar: i) que aparece en el listado de ofertas destacadas
	//para los usuarios y que el saldo del usuario se actualiza adecuadamente en la vista del ofertante (-
	//20).

	@Test
	public void PR28() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "PacoGonzalez@gmail.com", "123456");	
		
		//Obtenemos el dinero actual del usuario
		int dineroEsperado = (int) PO_MongoServer.getUserByEmail("PacoGonzalez@gmail.com").get("dinero");
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();
		
		//Nos dirigimos a agregar una oferta
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'ofertas/agregar')]");
		elementos.get(0).click();		
				
		//Rellenamos el formulario con datos validos
		PO_NewSaleView.fillForm(driver, "OfertaDestacadaTest", "Test", "12");
		
		//Comprobamos que estamos en nuestras ofertas
		SeleniumUtils.textoPresentePagina(driver,"Mis ofertas");
		
		//Clicamos la opcion de destacar
		elementos = PO_View.checkElement(driver, "free", "//td[contains(text(), 'OfertaDestacadaTest')]/following-sibling::*/a[contains(@href, 'ofertas/destacar')]");
		elementos.get(0).click();
				
		//Comprobamos que seguimos en nuestras ofertas
		SeleniumUtils.textoPresentePagina(driver,"Mis ofertas");
		
		//Se actualizo el saldo del usuario
		dineroEsperado = dineroEsperado-20;
		int dineroActual = (int) PO_MongoServer.getUserByEmail("PacoGonzalez@gmail.com").get("dinero");
		Assert.assertTrue(dineroEsperado==dineroActual);
		
		//Nos deslogueamos
		PO_NavView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		
		//Nos logueamos con otra cuenta para poder ver la oferta en la lista de ofertas
		PO_LoginView.fillForm(driver, "MariaDelagado@gmail.com", "123456");	
		
		//Comprobamos que se nos redirigio a la lista de ofertas
		SeleniumUtils.textoPresentePagina(driver,"Ofertas");
		
		
		int pagina=0;
		//Buscamos si el elemento está en la primera página
		elementos = driver.findElements(By.xpath("//*[contains(text(),'OfertaDestacadaTest')]"));
		while(elementos.isEmpty()) {
			//Si no lo está vamos buscando por todas hasta que lo encuentre
			 pagina++;
			 elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '?pg="+pagina+"')]");
			 elementos.get(0).click();
			 elementos = driver.findElements(By.xpath("//td[contains(text(),'OfertaDestacadaTest')]"));
		}
		//Comprobamos que aparece en la tabla
		PO_View.checkElement(driver, "text", "OfertaDestacadaTest");
		//Comprobamos que aparece como destacada en la tabla de ofertas
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div[3]/div/table/tbody/tr", PO_View.getTimeout());
		boolean destacado =false;
		for (int i = 0; i < elementos.size(); i++) {
			if(SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div[3]/div/table/tbody/tr["+(i+1)+"]/td[2]", PO_View.getTimeout()).get(0).getText().equals("OfertaDestacadaTest")) {
				List<WebElement> fila = SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div[3]/div/table/tbody/tr["+(i+1)+"]/td[1]", PO_View.getTimeout());
				Assert.assertTrue(fila.get(0).getText().equals("Destacada"));
				destacado = true;
				break;
			}
		}
		Assert.assertTrue(destacado);		
	}

	//PR029. Sobre el listado de ofertas de un usuario con menos de 20 euros de saldo, pinchar en el
	//enlace Destacada y a continuación comprobar que se muestra el mensaje de saldo no suficiente.
	@Test
	public void PR29() {
		// Vamos al formulario de inicio de sesion
		PO_NavView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "SaraOrtiz@gmail.com", "123456");	
		
		//Obtenemos el dinero actual del usuario
		int dineroEsperado = (int) PO_MongoServer.getUserByEmail("SaraOrtiz@gmail.com").get("dinero");
		//Comprobamos que es menor a 20 euros
		assertTrue(dineroEsperado<20);
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'sale-menu')]/a");
		elementos.get(0).click();
		
		//Nos dirigimos a agregar una oferta
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'ofertas/agregar')]");
		elementos.get(0).click();		
				
		//Rellenamos el formulario con datos validos
		PO_NewSaleView.fillForm(driver, "OfertaDestacadaTest", "Test", "12");
		
		//Comprobamos que estamos en nuestras ofertas
		SeleniumUtils.textoPresentePagina(driver,"Mis ofertas");
		
		//Clicamos la opcion de destacar
		elementos = PO_View.checkElement(driver, "free", "//td[contains(text(), 'OfertaDestacadaTest')]/following-sibling::*/a[contains(@href, 'ofertas/destacar')]");
		elementos.get(0).click();
				
		//Comprobamos que seguimos en nuestras ofertas
		SeleniumUtils.textoPresentePagina(driver,"Mis ofertas");
		
		//Comprobamos que nos muestra el aviso de saldo insuficiente
		SeleniumUtils.textoPresentePagina(driver,"No dispone de los 20€ para destacar la oferta");
	}
}

