package org.love.romantic;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("org.love.romantic.mapper")
public class RomanticServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(RomanticServerApplication.class, args);
    }
}
