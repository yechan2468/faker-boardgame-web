package com.yechan.fakerblue.config;

import com.yechan.fakerblue.auth.common.GameSessionService;
import java.security.Principal;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class GameSessionChannelInterceptor implements ChannelInterceptor {
    private final GameSessionService gameSessionService;

    public GameSessionChannelInterceptor(GameSessionService gameSessionService) {
        this.gameSessionService = gameSessionService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) return message;

        StompCommand command = accessor.getCommand();
        if (command != StompCommand.CONNECT && command != StompCommand.SEND && command != StompCommand.SUBSCRIBE)
            return message;

        Principal user = accessor.getUser();
        if (user == null || !gameSessionService.isActivePlayer(user.getName()))
            throw new AccessDeniedException("현재 로그인한 플레이어만 연결할 수 있습니다.");

        String destination = accessor.getDestination();
        if (command == StompCommand.SEND && (destination == null || !destination.startsWith("/app/")))
            throw new AccessDeniedException("게임 명령 경로만 전송할 수 있습니다.");
        if (command == StompCommand.SUBSCRIBE && (destination == null
                || !(destination.startsWith("/topic/") || destination.startsWith("/user/queue/"))))
            throw new AccessDeniedException("허용된 게임 메시지만 구독할 수 있습니다.");
        return message;
    }
}
