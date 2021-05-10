package com.uniovi.tests.pageobjects;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.bson.Document;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;

public class PO_MongoServer {
	
	private static String connectionString = "mongodb://sdi:sdi@cluster0-shard-00-00.p4zvd.mongodb.net:27017,cluster0-shard-00-01.p4zvd.mongodb.net:27017,cluster0-shard-00-02.p4zvd.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-12gia1-shard-0&authSource=admin&retryWrites=true&w=majority";
	
	public static void initialice() {
		Logger.getLogger("org.mongodb.driver").setLevel(Level.WARNING);
		
		List<Document> usuarios = new ArrayList<Document>();
		
		usuarios.add(new Document("email","PacoGonzalez@gmail.com").append("name", "Paco").append("surname", "Test").append("password","6fabd6ea6f1518592b7348d84a51ce97b87e67902aa5a9f86beea34cd39a6b4a").append("rol", "estandar").append("dinero", 100));
		usuarios.add(new Document("email","MariaDelagado@gmail.com").append("name", "Maria").append("surname", "Test").append("password","6fabd6ea6f1518592b7348d84a51ce97b87e67902aa5a9f86beea34cd39a6b4a").append("rol", "estandar").append("dinero", 100));
		usuarios.add(new Document("email","RaulSuarez@gmail.com").append("name", "Raul").append("surname", "Test").append("password","6fabd6ea6f1518592b7348d84a51ce97b87e67902aa5a9f86beea34cd39a6b4a").append("rol", "estandar").append("dinero", 100));
		usuarios.add(new Document("email","EmilioFernandez@gmail.com").append("name", "Emilio").append("surname", "Test").append("password","6fabd6ea6f1518592b7348d84a51ce97b87e67902aa5a9f86beea34cd39a6b4a").append("rol", "estandar").append("dinero", 100));
		usuarios.add(new Document("email","SaraOrtiz@gmail.com").append("name", "Sara").append("surname", "Test").append("password","6fabd6ea6f1518592b7348d84a51ce97b87e67902aa5a9f86beea34cd39a6b4a").append("rol", "estandar").append("dinero", 10));
		usuarios.add(new Document("email","SalomonParedes@gmail.com").append("name", "Salomon").append("surname", "Test").append("password","6fabd6ea6f1518592b7348d84a51ce97b87e67902aa5a9f86beea34cd39a6b4a").append("rol", "estandar").append("dinero", 1));
		
		List<Document> ofertas = new ArrayList<Document>();
		ofertas.add(new Document("vendedor","PacoGonzalez@gmail.com").append("titulo", "OfertaTest1").append("detalles", "Test").append("precio","2").append("comprada", null).append("destacada", false));
		ofertas.add(new Document("vendedor","PacoGonzalez@gmail.com").append("titulo", "OfertaTest2").append("detalles", "Test").append("precio","5").append("comprada", null).append("destacada", false));
		ofertas.add(new Document("vendedor","PacoGonzalez@gmail.com").append("titulo", "OfertaTest3").append("detalles", "Test").append("precio","7").append("comprada", "MariaDelagado@gmail.com").append("destacada", false));
		ofertas.add(new Document("vendedor","MariaDelagado@gmail.com").append("titulo", "OfertaTest4").append("detalles", "Test").append("precio","101").append("comprada", null).append("destacada", false));
		ofertas.add(new Document("vendedor","EmilioFernandez@gmail.com").append("titulo", "OfertaTest5").append("detalles", "Test").append("precio","6").append("comprada", "PacoGonzalez@gmail.com").append("destacada", false));
		ofertas.add(new Document("vendedor","SalomonParedes@gmail.com").append("titulo", "OfertaTest6").append("detalles", "Test").append("precio","6").append("comprada", null).append("destacada", false));
		ofertas.add(new Document("vendedor","EmilioFernandez@gmail.com").append("titulo", "OfertaTest7").append("detalles", "Test").append("precio","5").append("comprada", "PacoGonzalez@gmail.com").append("destacada", false));
		ofertas.add(new Document("vendedor","SaraOrtiz@gmail.com").append("titulo", "OfertaTest8").append("detalles", "Test").append("precio","3").append("comprada", "PacoGonzalez@gmail.com").append("destacada", false));
		ofertas.add(new Document("vendedor","SaraOrtiz@gmail.com").append("titulo", "OfertaAbuscar").append("detalles", "Test").append("precio","3").append("comprada", null).append("destacada", false));
		ofertas.add(new Document("vendedor","SalomonParedes@gmail.com").append("titulo", "OfertaTestCoste100").append("detalles", "Test").append("precio","100").append("comprada", null).append("destacada", false));
				
		
		
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
			//Conectarse al servidor Mongo
			MongoCollection<Document> users = mongoClient.getDatabase("myFirstDatabase").getCollection("usuarios");
			users.insertMany(usuarios);
			
			MongoCollection<Document> sales = mongoClient.getDatabase("myFirstDatabase").getCollection("ofertas");
			sales.insertMany(ofertas);
			
		}
	}
	
	
	
	public static void initialiceConversations() {
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
			
			List<Document> conversaciones = new ArrayList<Document>();
			conversaciones.add(new Document("idOferta",getSaleByTitle("OfertaTest2").get("_id")).append("emailInteresado", "EmilioFernandez@gmail.com").append("emailPropietario", "PacoGonzalez@gmail.com"));
			conversaciones.add(new Document("idOferta",getSaleByTitle("OfertaTest4").get("_id")).append("emailInteresado", "PacoGonzalez@gmail.com").append("emailPropietario", "MariaDelagado@gmail.com"));
			conversaciones.add(new Document("idOferta",getSaleByTitle("OfertaAbuscar").get("_id")).append("emailInteresado", "PacoGonzalez@gmail.com").append("emailPropietario", "SaraOrtiz@gmail.com"));

			
			MongoCollection<Document> conversations = mongoClient.getDatabase("myFirstDatabase").getCollection("conversaciones");
			conversations.insertMany(conversaciones);
			
			List<Document> mensajes = new ArrayList<Document>();
			mensajes.add(new Document("idConversacion",getConversationBySaleTitle("OfertaTest2").get("_id")).append("autor", "EmilioFernandez@gmail.com").append("texto", "hola").append("fecha", new Date()).append("leido", false));
			mensajes.add(new Document("idConversacion",getConversationBySaleTitle("OfertaTest2").get("_id")).append("autor", "EmilioFernandez@gmail.com").append("texto", "Que tal").append("fecha", new Date()).append("leido", false));
			mensajes.add(new Document("idConversacion",getConversationBySaleTitle("OfertaTest2").get("_id")).append("autor", "EmilioFernandez@gmail.com").append("texto", "Estoy interesado en la oferta").append("fecha", new Date()).append("leido", false));
			mensajes.add(new Document("idConversacion",getConversationBySaleTitle("OfertaTest4").get("_id")).append("autor", "PacoGonzalez@gmail.com").append("texto", "Hola").append("fecha", new Date()).append("leido", false));
			mensajes.add(new Document("idConversacion",getConversationBySaleTitle("OfertaAbuscar").get("_id")).append("autor", "PacoGonzalez@gmail.com").append("texto", "Hola").append("fecha", new Date()).append("leido", false));
		
			MongoCollection<Document> mensagges = mongoClient.getDatabase("myFirstDatabase").getCollection("mensajes");
			mensagges.insertMany(mensajes);
			
		}
		
		
		
	}
	
	public static void removeInitialiceData() {
		
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
			//Conectarse al servidor Mongo
			MongoCollection<Document> users = mongoClient.getDatabase("myFirstDatabase").getCollection("usuarios");
			users.deleteMany(new Document("surname","Test"));
			
			MongoCollection<Document> ofertas = mongoClient.getDatabase("myFirstDatabase").getCollection("ofertas");
			ofertas.deleteMany(new Document("detalles","Test"));
			
			MongoCollection<Document> conversaciones = mongoClient.getDatabase("myFirstDatabase").getCollection("conversaciones");
			conversaciones.deleteMany(new Document("emailInteresado","EmilioFernandez@gmail.com"));
			conversaciones.deleteMany(new Document("emailInteresado","PacoGonzalez@gmail.com"));
			conversaciones.deleteMany(new Document("emailInteresado","PacoGonzalez@gmail.com"));
			
			MongoCollection<Document> mensajes = mongoClient.getDatabase("myFirstDatabase").getCollection("mensajes");
			mensajes.deleteMany(new Document("autor","EmilioFernandez@gmail.com"));
			mensajes.deleteMany(new Document("autor","PacoGonzalez@gmail.com"));
			
		}
	}
	
	public static void removeUserByEmail(String email) {
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
			//Conectarse al servidor Mongo
			MongoCollection<Document> users = mongoClient.getDatabase("myFirstDatabase").getCollection("usuarios");
			users.deleteMany(new Document("email",email));
			MongoCollection<Document> ofertas = mongoClient.getDatabase("myFirstDatabase").getCollection("ofertas");
			ofertas.deleteMany(new Document("vendedor",email));
		}
	}
	
	public static void insertUser(Document user) {
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
			//Conectarse al servidor Mongo
			MongoCollection<Document> users = mongoClient.getDatabase("myFirstDatabase").getCollection("usuarios");
			users.insertOne(user);
		}
	}
	
	public static boolean userInDataBase(String email) {
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
			//Conectarse al servidor Mongo
			MongoCollection<Document> users = mongoClient.getDatabase("myFirstDatabase").getCollection("usuarios");
			List<Document> userList= users.find(new Document("email",email)).into(new ArrayList<>());
			if(userList.size()>0) {
				return true;
			}
		}
		return false;
	}
	
	public static List<Document> getAllSales(){
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
		//Conectarse al servidor Mongo
		MongoCollection<Document> sales = mongoClient.getDatabase("myFirstDatabase").getCollection("ofertas");
		return sales.find().into(new ArrayList<>());
		}
	}
	
	public static Document getUserByEmail(String email){
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
		//Conectarse al servidor Mongo
		MongoCollection<Document> users = mongoClient.getDatabase("myFirstDatabase").getCollection("usuarios");
		return users.find(new Document("email",email)).into(new ArrayList<>()).get(0);
		}
	}
	
	public static Document getSaleByTitle(String title){
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
		//Conectarse al servidor Mongo
		MongoCollection<Document> sales = mongoClient.getDatabase("myFirstDatabase").getCollection("ofertas");
		return sales.find(new Document("titulo",title)).into(new ArrayList<>()).get(0);
		}
	}
	public static Document getSaleByid(Object id){
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
		//Conectarse al servidor Mongo
		MongoCollection<Document> sales = mongoClient.getDatabase("myFirstDatabase").getCollection("ofertas");
		return sales.find(new Document("_id",id)).into(new ArrayList<>()).get(0);
		}
	}
	public static Document getConversationBySaleTitle(String title){
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
		//Conectarse al servidor Mongo
		MongoCollection<Document> conversations = mongoClient.getDatabase("myFirstDatabase").getCollection("conversaciones");
		return conversations.find(new Document("idOferta", getSaleByTitle(title).get("_id"))).into(new ArrayList<>()).get(0);
		}
	}
	public static List<Document> getConversationsByEmail(String email){
		try (MongoClient mongoClient = MongoClients.create(connectionString)) {
		List<Document>	conversaciones = new ArrayList<Document>();
		//Conectarse al servidor Mongo
		MongoCollection<Document> conversations = mongoClient.getDatabase("myFirstDatabase").getCollection("conversaciones");
		conversaciones.addAll(conversations.find(new Document("emailInteresado", email)).into(new ArrayList<>()));
		conversaciones.addAll(conversations.find(new Document("emailPropietario", email)).into(new ArrayList<>()));
		return conversaciones;
		}
	}
}
