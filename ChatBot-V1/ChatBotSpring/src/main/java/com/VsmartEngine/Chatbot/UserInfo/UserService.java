package com.VsmartEngine.Chatbot.UserInfo;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
	
	@Autowired
	private UserInfoRepository userinforepository;
	
	 @Autowired
	    private UserInfoRepository userInfoRepository;

	 public void updateLastSeen(String email, LocalDateTime time) {
	        Optional<UserInfo> optionalUser = userInfoRepository.findByEmail(email);
	        if (optionalUser.isPresent()) {
	            UserInfo user = optionalUser.get();
	            user.setLastSeen(time);
	            userInfoRepository.save(user);
	        }
	    }

	    public Optional<UserInfo> getUserByEmail(String email) {
	        return userInfoRepository.findByEmail(email);
	    }

	    public boolean isUserOnline(UserInfo user) {
	        return user.getLastSeen() != null &&
	               user.getLastSeen().isAfter(LocalDateTime.now().minusMinutes(1));
	    }
}
