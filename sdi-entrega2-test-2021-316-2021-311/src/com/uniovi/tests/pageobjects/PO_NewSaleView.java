package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_NewSaleView extends PO_NavView {
	
	static public void fillForm(WebDriver driver, String titlep,String detailsp,String pricep) {
			WebElement title = driver.findElement(By.name("titulo"));
			title.click();
			title.clear();
			title.sendKeys(titlep);
			
			WebElement details = driver.findElement(By.name("detalles"));
			details.click();
			details.clear();
			details.sendKeys(detailsp);
			
			WebElement price = driver.findElement(By.name("precio"));
			price.click();
			price.clear();
			price.sendKeys(pricep);
			
			//Pulsar el boton de Sumit.
			By boton = By.className("btn");
			driver.findElement(boton).click();
		}
}
