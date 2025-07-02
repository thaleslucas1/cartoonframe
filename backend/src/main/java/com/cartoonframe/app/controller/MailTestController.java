package com.cartoonframe.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MailTestController {

    @Autowired
    private JavaMailSender mailSender;

    @GetMapping("/test-send-mail")
    public String testSendMail() {
        try {
            // Ativa debug via propriedades no mailSender
            if (mailSender instanceof JavaMailSenderImpl) {
                ((JavaMailSenderImpl) mailSender).getJavaMailProperties().put("mail.debug", "true");
            }

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo("seu-email@gmail.com");  // seu e-mail
            msg.setSubject("Teste SMTP com debug");
            msg.setText("Esse é um email de teste com debug detalhado do JavaMail.");
            mailSender.send(msg);

            return "Email enviado com sucesso! Verifique o console para logs detalhados.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Erro ao enviar email: " + e.getMessage();
        }
    }
}

