package com.VsmartEngine.Chatbot.Admin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.VsmartEngine.Chatbot.Departments.Department;
import com.VsmartEngine.Chatbot.Departments.DepartmentRepository;
import com.VsmartEngine.Chatbot.MailConfiguration.EmailService;
import com.VsmartEngine.Chatbot.TokenGeneration.JwtUtil;
import com.VsmartEngine.Chatbot.TokenGeneration.TokenBlacklist;

import jakarta.transaction.Transactional;

@CrossOrigin()
@RequestMapping("/chatbot")
@Controller
public class AdminRegisterController {

    @Value("${UserOrigin}")
    private String frontendOrigin;

    @Autowired
    private AdminRegisterRepository adminregisterrepository;

    @Autowired
    private DepartmentRepository departmentrepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RoleRepository rolerepository;

    @Autowired
    private EmailService emailservice;

    @Autowired
    private TokenBlacklist tokenBlacklist;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chatbot/register
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestParam("username") String username,
            @RequestParam("email")    String email,
            @RequestParam("password") String password,
            @RequestParam(value = "role", required = false) String role,              
            Principal principal) {

        try {
            long count = adminregisterrepository.count();
            Optional<AdminRegister> existingUserOpt = adminregisterrepository.findByEmail(email);

            if (existingUserOpt.isPresent()) {
                AdminRegister existingUser = existingUserOpt.get();
                if (existingUser.getUsername() != null && existingUser.getPassword() != null) {
                    return ResponseEntity.badRequest().body("Email is already registered.");
                }
                existingUser.setUsername(username);
                existingUser.setPassword(new BCryptPasswordEncoder().encode(password));
                existingUser.setStatus(true);
                adminregisterrepository.save(existingUser);
                return ResponseEntity.ok("User registered successfully.");
            }

            if (count == 0) {
                AdminRegister newUser = new AdminRegister();
                newUser.setUsername(username);
                newUser.setEmail(email);
                newUser.setPassword(new BCryptPasswordEncoder().encode(password));
                Role adminRole = rolerepository.findByRole("ADMIN")
                        .orElseThrow(() -> new RuntimeException("Role 'ADMIN' not found"));
                newUser.setRole(adminRole);
                newUser.setStatus(true);
                adminregisterrepository.save(newUser);
                return ResponseEntity.ok("First Admin registered successfully.");
            }

            return ResponseEntity.badRequest()
                    .body("Invalid registration attempt. Please check your invitation.");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chatbot/login
    //
    // FIX: Now returns departmentId so Flutter can pass it to ActiveChatPage.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> AdminLogin(@RequestBody Map<String, String> loginRequest) {
        try {
            String email    = loginRequest.get("email");
            String password = loginRequest.get("password");

            Optional<AdminRegister> admin = adminregisterrepository.findByEmail(email);
            if (!admin.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("{\"message\": \"User not found\"}");
            }

            AdminRegister adminregister = admin.get();
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            if (!encoder.matches(password, adminregister.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("{\"message\": \"Incorrect password\"}");
            }

            String role     = adminregister.getRole().getRole();
            Long   id       = adminregister.getId();
            String jwtToken = jwtUtil.generateToken(email, id, role);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token",   jwtToken);
            responseBody.put("message", "Login successful");
            responseBody.put("name",    adminregister.getUsername());
            responseBody.put("email",   adminregister.getEmail());
            responseBody.put("userId",  adminregister.getId());
            responseBody.put("role",    adminregister.getRole().getRole());

            // ── FIX: include departmentId in login response ────────────────
            // Flutter needs this to connect to the correct WebSocket topic
            // and to pass it into ActiveChatPage.
            if (adminregister.getDepartment() != null) {
                responseBody.put("departmentId", adminregister.getDepartment().getId());
            } else {
                responseBody.put("departmentId", null);
            }

            return ResponseEntity.ok(responseBody);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chatbot/logout
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        tokenBlacklist.blacklistToken(token);
        return ResponseEntity.ok().body("Logged out successfully");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chatbot/getAllAdmin
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/getAllAdmin")
    public ResponseEntity<List<AdminRegister>> getAllUser() {
        try {
            List<AdminRegister> getAdmin = adminregisterrepository.findAllByOrderByIdAsc();
            if (getAdmin.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(getAdmin, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /chatbot/delete/{id}
    // ─────────────────────────────────────────────────────────────────────────
    @DeleteMapping("/delete/{id}")
    @Transactional
    public ResponseEntity<String> deleteAdminById(
            @RequestHeader("Authorization") String token,
            @PathVariable("id") Long id) {

        try {
            String role = jwtUtil.getRoleFromToken(token);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("{\"message\": \"Only admin can delete subadmin\"}");
            }

            Optional<AdminRegister> adminOpt = adminregisterrepository.findById(id);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("{\"message\": \"Admin not found\"}");
            }

            adminregisterrepository.delete(adminOpt.get());
            return ResponseEntity.ok("{\"message\": \"Admin deleted successfully\"}");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"An error occurred while deleting the admin.\"}");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chatbot/invite
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/invite")
    public ResponseEntity<String> sendInvitation(
            @RequestParam String email,
            @RequestParam String role,
            @RequestHeader("Authorization") String token) {
        try {
            String roles = jwtUtil.getRoleFromToken(token);
            if (!"ADMIN".equals(roles)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("{\"message\": \"Only admin can add agent and admin\"}");
            }

            if (adminregisterrepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body("Email is already registered.");
            }

            Role userRole = rolerepository.findByRole(role.toUpperCase())
                    .orElseThrow(() -> new RuntimeException("Role '" + role.toUpperCase() + "' not found"));

            AdminRegister newUser = new AdminRegister();
            newUser.setEmail(email);
            newUser.setRole(userRole);
            newUser.setStatus(false);
            newUser.setCode(UUID.randomUUID().toString());

            String link    = frontendOrigin + "/#/register?token=" + newUser.getCode();
            String subject = "You have been invited to join";
            String body    = "Hi,\n\nYou have been invited to join. Click the link below:\n\n"
                             + link + "\n\n-Chatbot Team";

            emailservice.sendEmail(email, subject, body);
            adminregisterrepository.save(newUser);

            return ResponseEntity.ok("Invitation sent successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chatbot/register-token/{token}
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/register-token/{token}")
    public ResponseEntity<?> getDetailsFromToken(@PathVariable String token) {
        Optional<AdminRegister> invitation = adminregisterrepository.findByCode(token);
        if (invitation.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("email", invitation.get().getEmail());
            response.put("role",  invitation.get().getRole().getRole());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Invalid or expired token.");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chatbot/getadminnames
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/getadminnames")
    public ResponseEntity<List<AdminUserDto>> getAllUsernamesAndIds() {
        try {
            List<AdminUserDto> users = adminregisterrepository.findAllUserIdAndUsernameAndDepartment();
            if (users.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chatbot/getAdminbyid/{id}
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/getAdminbyid/{id}")
    public ResponseEntity<AdminRegister> getUserById(@PathVariable Long id) {
        Optional<AdminRegister> userOptional = adminregisterrepository.findById(id);
        if (userOptional.isPresent()) {
            return ResponseEntity.ok(userOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /chatbot/updateAdmin/{id}
    // ─────────────────────────────────────────────────────────────────────────
    @PatchMapping("/updateAdmin/{id}")
    public ResponseEntity<?> updateAdmin(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestParam("email") String email,
            @RequestParam("role")  String role) {
        try {
            String roles = jwtUtil.getRoleFromToken(token);
            if (!"ADMIN".equals(roles)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("{\"message\": \"Only admin can update\"}");
            }

            Optional<AdminRegister> optionalAdmin = adminregisterrepository.findById(id);
            if (optionalAdmin.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("{\"message\": \"admin or agent not found\"}");
            }

            Optional<AdminRegister> emailExists = adminregisterrepository.findByEmail(email);
            if (emailExists.isPresent() && emailExists.get().getId() != id) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("{\"message\": \"Email is already registered\"}");
            }

            Role userRole = rolerepository.findByRole(role.toUpperCase())
                    .orElseThrow(() -> new RuntimeException("Role '" + role.toUpperCase() + "' not found"));

            AdminRegister adminregister = optionalAdmin.get();
            if (adminregister.isStatus()) {
                return ResponseEntity.ok().body("{\"message\": \"No need to update\"}");
            } else {
                adminregister.setEmail(email);
                adminregister.setRole(userRole);
                adminregister.setStatus(false);
                adminregister.setCode(UUID.randomUUID().toString());

                String link    = frontendOrigin + "/#/register?token=" + adminregister.getCode();
                String subject = "You have been invited to join";
                String body    = "Hi,\n\nYou have been invited to join. Click the link below:\n\n"
                                 + link + "\n\n-Chatbot Team";

                emailservice.sendEmail(email, subject, body);
                adminregisterrepository.save(adminregister);
            }

            return ResponseEntity.ok().body("{\"message\": \"Admin updated successfully\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Error while updating\"}");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chatbot/check-admin-exists
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/check-admin-exists")
    public ResponseEntity<Boolean> checkIfAdminExists() {
        boolean adminExists = adminregisterrepository.existsAdminByRole();
        return ResponseEntity.ok(adminExists);
    }
}