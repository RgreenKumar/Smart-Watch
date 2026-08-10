package com.VsmartEngine.Chatbot.MailConfiguration;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}") private String UserName;
    @Value("${spring.mail.port}") private int Port;
    @Value("${spring.mail.host}") private String Host;
    @Value("${spring.mail.password}") private String Password;

    public boolean sendEmail(String to, String subject, String body) {
        try {
            JavaMailSenderImpl mailSenderImpl = new JavaMailSenderImpl();
            mailSenderImpl.setHost(Host);
            mailSenderImpl.setPort(Port);
            mailSenderImpl.setUsername(UserName);
            mailSenderImpl.setPassword(Password);
            
            Properties props = mailSenderImpl.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.debug", "true");


            this.mailSender = mailSenderImpl;
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom(UserName);

            mailSender.send(message);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    }

