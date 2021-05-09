package com.uniovi.tests.pageobjects;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_SalesView extends PO_NavView {

	static public void search(WebDriver driver, String text) {
		WebElement busqueda = driver.findElement(By.name("busqueda"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys(text);
		//Pulsar el boton busqueda.
		By boton = By.className("btn");
		driver.findElement(boton).click();	
	}
	
	
	static public void buscarEnPaginaPorTitulo(WebDriver driver, String title) {
		int pagina=0;
		//Buscamos si el elemento está en la primera página
		List<WebElement> elementos = driver.findElements(By.xpath("//td[contains(text(),'"+title+"')]"));
		while(elementos.isEmpty()) {
			//Si no lo está vamos buscando por todas hasta que lo encuentre
			 pagina++;
			 elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '?pg="+pagina+"')]");
			 elementos.get(0).click();
			 elementos = driver.findElements(By.xpath("//td[contains(text(),'"+title+"')]"));
		}
	}
}
