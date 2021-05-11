package com.uniovi.init;

import com.uniovi.tests.pageobjects.PO_MongoServer;

public class Init {

	public static void main(String[] args) {
		PO_MongoServer.removeInitialiceData();
		PO_MongoServer.initialice();
		PO_MongoServer.initialiceConversations();

	}

}
