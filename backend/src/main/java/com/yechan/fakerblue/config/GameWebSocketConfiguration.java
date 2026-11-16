package com.yechan.fakerblue.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;

@Configuration
@EnableWebSocketMessageBroker
public class GameWebSocketConfiguration implements WebSocketMessageBrokerConfigurer {
    @Value("${faker.websocket.allowed-origin-patterns:http://localhost:*,https://localhost:*,http://127.0.0.1:*,https://127.0.0.1:*}")
    private String allowedOriginPatterns;
    private final GameSessionChannelInterceptor channelInterceptor;
    private final WebSocketSessionRegistry sessionRegistry;

    public GameWebSocketConfiguration(GameSessionChannelInterceptor channelInterceptor,
            WebSocketSessionRegistry sessionRegistry) {
        this.channelInterceptor = channelInterceptor;
        this.sessionRegistry = sessionRegistry;
    }

    @Override public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }
    @Override public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns(allowedOriginPatterns.split(","));
    }

    @Override public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(channelInterceptor);
    }

    @Override public void configureWebSocketTransport(
            org.springframework.web.socket.config.annotation.WebSocketTransportRegistration registration) {
        registration.addDecoratorFactory(handler -> new WebSocketHandlerDecorator(handler) {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) throws Exception {
                sessionRegistry.register(session);
                super.afterConnectionEstablished(session);
            }

            @Override
            public void afterConnectionClosed(WebSocketSession session,
                    org.springframework.web.socket.CloseStatus closeStatus) throws Exception {
                sessionRegistry.remove(session);
                super.afterConnectionClosed(session, closeStatus);
            }
        });
    }
}
