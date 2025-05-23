package com.email.writer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class EmailWriterApplication {

	public static void main(String[] args) {

		SpringApplication.run(EmailWriterApplication.class, args);
	}

}
