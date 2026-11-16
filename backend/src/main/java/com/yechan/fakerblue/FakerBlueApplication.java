package com.yechan.fakerblue;

import io.github.cdimascio.dotenv.Dotenv;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FakerBlueApplication {

	public static void main(String[] args) {
		loadDotenv();
		SpringApplication.run(FakerBlueApplication.class, args);
	}

	private static void loadDotenv() {
		Path currentDirectory = Path.of("").toAbsolutePath();
		Path dotenvDirectory = Files.isRegularFile(currentDirectory.resolve(".env"))
				? currentDirectory
				: currentDirectory.getParent();

		if (dotenvDirectory == null || !Files.isRegularFile(dotenvDirectory.resolve(".env"))) {
			return;
		}

		Dotenv.configure().directory(dotenvDirectory.toString()).load().entries().forEach(entry -> {
			if (System.getenv(entry.getKey()) == null && System.getProperty(entry.getKey()) == null) {
				System.setProperty(entry.getKey(), entry.getValue());
			}
		});
	}

}
