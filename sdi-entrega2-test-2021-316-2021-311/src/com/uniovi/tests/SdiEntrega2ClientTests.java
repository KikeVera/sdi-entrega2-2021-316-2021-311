package com.uniovi.tests;




import java.util.List;

import org.bson.Document;
import org.junit.After;
import org.junit.AfterClass;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.uniovi.tests.pageobjects.PO_LoginView;
import com.uniovi.tests.pageobjects.PO_MongoServer;

import com.uniovi.tests.pageobjects.PO_View;
import com.uniovi.tests.util.SeleniumUtils;

//Ordenamos las pruebas por el nombre del método
@FixMethodOrder(MethodSorters.NAME_ASCENDING) 
public class SdiEntrega2ClientTests {
	
		//Adolfo
		//static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
		//static String Geckdriver024 = "C:\\Carpetas\\Clase2\\SDI\\PL-SDI-Sesión5-material\\geckodriver024win64.exe";
		//Kike
		 static String PathFirefox65="C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe";
		static String Geckdriver024="C:\\Users\\Kike\\Desktop\\SDI\\geckoDriver\\geckodriver024win64.exe";
	
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024); 
	static String URLHTML = "https://localhost:8081/cliente.html?w=ofertas";
	
	
	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}
	
	
	@Before
	public void setUp(){
		driver.navigate().to(URLHTML);
		//Eliminamos los datos introducidos para el test
		PO_MongoServer.removeInitialiceData();
		//Introducimos unos datos base para la realizacion del test en la base de datos
		PO_MongoServer.initialice();
	}
	@After
	public void tearDown(){
		PO_MongoServer.removeInitialiceData();
		driver.manage().deleteAllCookies();
	}
	
	@BeforeClass 
	static public void begin() {
		//COnfiguramos las pruebas.
		PO_View.setTimeout(4);

	}
	@AfterClass
	static public void end() {
		//Cerramos el navegador al finalizar las pruebas
		driver.quit();
		PO_MongoServer.removeInitialiceData();
	}
	
	//PR030. Inicio de sesión con datos válidos.
		@Test
		public void PR30() {

			// Vamos al formulario de inicio de sesion
			List<WebElement> elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "PacoGonzalez@gmail.com", "123456");
			PO_View.checkElement(driver, "text", "Ofertas de la tienda");
			
			
		}
		
		//PR031. Inicio de sesión con datos inválidos (email existente, pero contraseña incorrecta).
		@Test
		public void PR31() {

			// Vamos al formulario de inicio de sesion
			List<WebElement> elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "PacoGonzalez@gmail.com", "123");
			PO_View.checkElement(driver, "text", "Contraseña no válida");
			
		}
		
		//PR032. Inicio de sesión con datos válidos (campo email o contraseña vacíos).
		@Test
		public void PR32() {

			// Vamos al formulario de inicio de sesion
			List<WebElement> elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "", "123");
			PO_View.checkElement(driver, "text", "No pueden existir campos vacíos");		
		}
		
		//PR033. Mostrar el listado de ofertas disponibles y comprobar que se muestran todas las que
		//existen, menos las del usuario identificado.

		@Test
		public void PR33() {
			
			// Vamos al formulario de inicio de sesion
			List<WebElement> elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "PacoGonzalez@gmail.com", "123456");
			PO_View.checkElement(driver, "text", "Ofertas de la tienda");
			
			//Obtenemos las ofertas
			List<Document> sales = PO_MongoServer.getAllSales();
			//Buscamos cada oferta en la lista de ofertas
			for (Document document : sales) {
				if(!document.getString("vendedor").equals("PacoGonzalez@gmail.com")) {
					PO_View.checkElement(driver, "free", "//td[contains(text(), '"+document.getString("titulo")+"')]");
				}
			}
			
			
		}
		//PR034. Sobre una búsqueda determinada de ofertas (a elección de desarrollador), enviar un
		//mensaje a una oferta concreta. Se abriría dicha conversación por primera vez. Comprobar que el
		//mensaje aparece en el listado de mensajes.
		@Test
		public void PR34() {
			PO_MongoServer.initialiceConversations();
			// Vamos al formulario de inicio de sesion
			List<WebElement> elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "PacoGonzalez@gmail.com", "123456");
			PO_View.checkElement(driver, "text", "Ofertas de la tienda");
			
			//Hacemos click en la ofertaTest5 que no tiene ninguna conversación
			elementos= PO_View.checkElement(driver, "free","//td[text()= 'OfertaTest5']/following-sibling::*[4]");
			elementos.get(0).click();
			
			//Escribimos un mensaje en el campo de texto
			WebElement msg = driver.findElement(By.id("message"));
			msg.click();
			msg.clear();
			msg.sendKeys("Hola que tal");
			//Enviamos el mensaje
			By boton = By.id("boton-send-message");
			driver.findElement(boton).click();	
			//Comprobamos que aparece el mensaje
			PO_View.checkElement(driver, "text", "Hola que tal");	
			PO_View.checkElement(driver, "class", "propios");
			

					
		}
		//PR035. Sobre el listado de conversaciones enviar un mensaje a una conversación ya abierta.
		//Comprobar que el mensaje aparece en el listado de mensajes.
		@Test
		public void PR35() {

			PO_MongoServer.initialiceConversations();
			// Vamos al formulario de inicio de sesion
			List<WebElement> elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "PacoGonzalez@gmail.com", "123456");
			PO_View.checkElement(driver, "text", "Ofertas de la tienda");	
			
			//Nos dirigimos a nuestras conversaciones
			
			elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mConversaciones\"]/a");
			elementos.get(0).click();
			
			//Clickamos en conversar en la primera que tengamos abierta
			elementos = PO_View.checkElement(driver, "free", "/html/body/div/div/table/tbody/tr[1]/td[4]/a");
			elementos.get(0).click();
			
			//Comprobamos que ya existe un mensaje
			PO_View.checkElement(driver, "text", "Hola");	
			PO_View.checkElement(driver, "class", "propios");
			
			//Escribimos un mensaje en el campo de texto
			WebElement msg = driver.findElement(By.id("message"));
			msg.click();
			msg.clear();
			msg.sendKeys("Hola que tal");
			//Enviamos el mensaje
			By boton = By.id("boton-send-message");
			driver.findElement(boton).click();	
			//Comprobamos que aparece el mensaje
			PO_View.checkElement(driver, "text", "Hola que tal");	
			PO_View.checkElement(driver, "class", "propios");
		}
		
		//PR036. Mostrar el listado de conversaciones ya abiertas. Comprobar que el listado contiene las
		//conversaciones que deben ser.
		@Test
		public void PR36() {
			//Inicializamos conversaciones
			PO_MongoServer.initialiceConversations();
			// Vamos al formulario de inicio de sesion
			List<WebElement> elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "PacoGonzalez@gmail.com", "123456");
			PO_View.checkElement(driver, "text", "Ofertas de la tienda");
			//Nos dirigimos a nuestras conversaciones
			
			elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mConversaciones\"]/a");
			elementos.get(0).click();
			PO_View.checkElement(driver, "text", "Lista de conversaciones");
			List<Document> conversations = PO_MongoServer.getConversationsByEmail("PacoGonzalez@gmail.com");
			for(Document document : conversations) {
				PO_View.checkElement(driver, "free", "//td[contains(text(), '"+PO_MongoServer.getSaleByid(document.get("idOferta")).getString("titulo")+"')]");
			}
			
		}
		//PR037. Sobre el listado de conversaciones ya abiertas. Pinchar el enlace Eliminar de la primera y
		//comprobar que el listado se actualiza correctamente.
		@Test
		public void PR37() {
			
			//Inicializamos conversaciones
			PO_MongoServer.initialiceConversations();

			// Vamos al formulario de inicio de sesion
			List<WebElement> elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "PacoGonzalez@gmail.com", "123456");
			PO_View.checkElement(driver, "text", "Ofertas de la tienda");
			//Nos dirigimos a nuestras conversaciones
			elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mConversaciones\"]/a");
			elementos.get(0).click();
			PO_View.checkElement(driver, "text", "Lista de conversaciones");
			
			elementos = PO_View.checkElement(driver, "free", "/html/body/div/div/table/tbody/tr[1]/td[2]");
			String oferta = elementos.get(0).getText();	
			
			//Clickamos en eliminar
			elementos = PO_View.checkElement(driver, "free", "/html/body/div/div/table/tbody/tr[1]/td[5]/a");
			elementos.get(0).click();
			
			//Comprobamos que se elimino
			PO_View.checkNotElement(driver, oferta);
		}
		//PR038. Sobre el listado de conversaciones ya abiertas. Pinchar el enlace Eliminar de la última y
		//comprobar que el listado se actualiza correctamente.
		@Test
		public void PR38() {
			
			//Inicializamos conversaciones
			PO_MongoServer.initialiceConversations();

			// Vamos al formulario de inicio de sesion
			List<WebElement> elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "PacoGonzalez@gmail.com", "123456");
			PO_View.checkElement(driver, "text", "Ofertas de la tienda");
			//Nos dirigimos a nuestras conversaciones
			elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mConversaciones\"]/a");
			elementos.get(0).click();
			PO_View.checkElement(driver, "text", "Lista de conversaciones");
			
			List<Document> conversations = PO_MongoServer.getConversationsByEmail("PacoGonzalez@gmail.com");
			
			elementos = PO_View.checkElement(driver, "free", "/html/body/div/div/table/tbody/tr["+(conversations.size()+1)+"]/td[2]");
			String oferta = elementos.get(0).getText();	
			
			//Clickamos en eliminar
			elementos = PO_View.checkElement(driver, "free", "/html/body/div/div/table/tbody/tr["+(conversations.size()+1)+"]/td[5]/a");
			elementos.get(0).click();
			
			//Comprobamos que se elimino
			PO_View.checkNotElement(driver, oferta);	
			
		}
		//PR039. Identificarse en la aplicación y enviar un mensaje a una oferta, validar que el mensaje
		//enviado aparece en el chat. Identificarse después con el usuario propietario de la oferta y validar
		//que tiene un mensaje sin leer, entrar en el chat y comprobar que el mensaje pasa a tener el estado
		//leído
		@Test
		public void PR39() {
			//Inicializamos conversaciones
			PO_MongoServer.initialiceConversations();
			
			// Vamos al formulario de inicio de sesion
			List<WebElement> elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "PacoGonzalez@gmail.com", "123456");
			PO_View.checkElement(driver, "text", "Ofertas de la tienda");
			
			//Hacemos click en la ofertaTest5 que no tiene ninguna conversación
			elementos= PO_View.checkElement(driver, "free","//td[text()= 'OfertaTest5']/following-sibling::*[4]");
			elementos.get(0).click();
			
			//Escribimos un mensaje en el campo de texto
			WebElement msg = driver.findElement(By.id("message"));
			msg.click();
			msg.clear();
			msg.sendKeys("Hola que tal");
			//Enviamos el mensaje
			By boton = By.id("boton-send-message");
			driver.findElement(boton).click();	
			//Comprobamos que aparece el mensaje
			PO_View.checkElement(driver, "text", "Hola que tal");	
			PO_View.checkElement(driver, "class", "propios");
			
			//Nos desconectamos
			 elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mdesconectar\"]/a");
			elementos.get(0).click();
			
			// Vamos al formulario de inicio de sesion con emilio
			 elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "EmilioFernandez@gmail.com", "123456");
			PO_View.checkElement(driver, "text", "Ofertas de la tienda");
			
			//Nos dirigimos a nuestras conversaciones
			
			elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mConversaciones\"]/a");
			elementos.get(0).click();
			
			//Comprobamos que hay un mensaje sin leer
			elementos= PO_View.checkElement(driver, "free","//td[text()= 'OfertaTest5']/following-sibling::td[text()='1']");
			
			
			//Hacemos click en conversar en la conversación de ofertaTest5
			elementos= PO_View.checkElement(driver, "free","//td[text()= 'OfertaTest5']/following-sibling::*[2]/a");
			elementos.get(0).click();
			
			//Chekeamos que nada mas entrar el mensaje no está leído
			PO_View.checkElement(driver, "text", "✔");
			
			//Chekeamos que después pasa a estarlo automaticamente
			
			PO_View.checkElement(driver, "text", "✔✔");
			
			
						
		}
		//PR040. Identificarse en la aplicación y enviar tres mensajes a una oferta, validar que los mensajes
		//enviados aparecen en el chat. Identificarse después con el usuario propietario de la oferta y
		//validar que el número de mensajes sin leer aparece en su oferta.
		@Test
		public void PR40() {
			
			//Inicializamos conversaciones
			PO_MongoServer.initialiceConversations();

			// Vamos al formulario de inicio de sesion
			List<WebElement> elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mLogin\"]/a");
			elementos.get(0).click();
			PO_LoginView.fillFormClient(driver, "PacoGonzalez@gmail.com", "123456");
			PO_View.checkElement(driver, "text", "Ofertas de la tienda");
			//Nos dirigimos a nuestras conversaciones
			elementos = PO_View.checkElement(driver, "free", "//*[@id=\"mConversaciones\"]/a");
			elementos.get(0).click();
			PO_View.checkElement(driver, "text", "Lista de conversaciones");
			
			//Obtenemos la lista de elementos
			elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "/html/body/div/div/table/tbody/tr", PO_View.getTimeout());
			for (int i = 0;i<elementos.size();i++) {
				WebElement elemento = PO_View.checkElement(driver, "free", "/html/body/div/div/table/tbody/tr["+(i+1)+"]/td[2]").get(0);
				String oferta = elemento.getText();
				if(oferta.equals("OfertaTest2")) {
					PO_View.checkElement(driver, "free", "/html/body/div/div/table/tbody/tr["+(i+1)+"]/td[contains(text(), '3')]").get(0);
					break;
				}
			}
		}
}
