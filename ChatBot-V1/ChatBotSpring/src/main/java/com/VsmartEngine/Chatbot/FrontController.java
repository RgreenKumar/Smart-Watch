package com.VsmartEngine.Chatbot;

import java.security.Principal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.VsmartEngine.Chatbot.Admin.AdminRegisterController;
//import com.VsmartEngine.Chatbot.Overview.OverviewController;

@CrossOrigin()
@RestController
@RequestMapping("/chatbot")
public class FrontController {
	
	@Autowired
	private AdminRegisterController adminregistercontroller;
	
//	@Autowired
//	private OverviewController overviewcontroller;
	
//	@PostMapping("/register")
//    public ResponseEntity<?> register(@RequestParam("username") String username,
//                                           @RequestParam("email") String email,
//                                           @RequestParam("password") String password,
//                                           @RequestParam(value="role",required=false) String role,
//                                           Principal principal) {
//
//		return adminregistercontroller.register(username, email, password, role, principal);
//	}
//	
//	@PostMapping("/login")
//	public ResponseEntity<?> AdminLogin(@RequestBody Map<String, String> loginRequest){
//		return adminregistercontroller.AdminLogin(loginRequest);
//	}
	
//	@PostMapping("/AddOverview")
//	public ResponseEntity<?> AddProperty(@RequestParam("propertyname") String propertyname,
//			@RequestParam("active") Boolean active,
//			@RequestParam("propertyurl") String propertyurl,
//			@RequestParam("propertyimage") MultipartFile propertyimage,
//			@RequestHeader("Authorization") String token){
//		return overviewcontroller.AddProperty(propertyname, active, propertyurl, propertyimage, token);
//	}
//	
//	
//	@GetMapping("/getproperty/{id}")
//	public ResponseEntity<?> getPropertyById(@PathVariable Long id) {
//		return overviewcontroller.getPropertyById(id);
//	}
	


}
