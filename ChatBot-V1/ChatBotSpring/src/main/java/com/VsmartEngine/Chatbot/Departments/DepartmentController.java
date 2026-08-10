package com.VsmartEngine.Chatbot.Departments;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import com.VsmartEngine.Chatbot.Admin.AdminRegister;
import com.VsmartEngine.Chatbot.Admin.AdminRegisterRepository;
import com.VsmartEngine.Chatbot.TokenGeneration.JwtUtil;


@CrossOrigin()
@RequestMapping("/chatbot")
@Controller
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentrepository;

    @Autowired
    private AdminRegisterRepository adminregisterrepository;

    @Autowired
    private JwtUtil jwtUtil;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chatbot/adddepartment
    // Admin can assign any agent freely — agent is moved from old dept automatically.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/adddepartment")
    public ResponseEntity<?> addDepartment(@RequestBody DepartmentRequestDto departmentRequest,
                                           @RequestHeader("Authorization") String token) {
        try {
            String role = jwtUtil.getRoleFromToken(token);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("{\"message\": \"Only admin can add departments\"}");
            }

            if (departmentRequest.getAdminIds() == null || departmentRequest.getAdminIds().isEmpty()) {
                return ResponseEntity.badRequest().body("Admin IDs must not be empty.");
            }

            List<AdminRegister> admins = adminregisterrepository.findAllById(departmentRequest.getAdminIds());
            if (admins.isEmpty()) {
                return ResponseEntity.badRequest().body("No valid admins found for the provided IDs.");
            }

            // Create new department first so we have its ID
            Department department = new Department();
            department.setDepName(departmentRequest.getDepName());
            department.setDescription(departmentRequest.getDescription());
            departmentrepository.save(department);

            // Assign agents — no conflict check.
            // Admin is allowed to freely move agents between departments.
            for (AdminRegister admin : admins) {
                admin.setDepartment(department);
            }
            department.setAdmins(admins);

            // REQUIRED: @OneToMany(mappedBy) has NO cascade — must explicitly
            // persist each admin's department_id FK or it stays NULL in the DB.
            adminregisterrepository.saveAll(admins);
            departmentrepository.save(department);

            return ResponseEntity.ok(department);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chatbot/getAllDepartment
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/getAllDepartment")
    public ResponseEntity<List<DepartmentSummaryDto>> getAllDepartments() {
        try {
            List<Department> departments = departmentrepository.findAllByOrderByIdAsc();
            if (departments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            List<DepartmentSummaryDto> response = departments.stream()
                .map(dep -> new DepartmentSummaryDto(
                    dep.getId(),
                    dep.getDepName(),
                    dep.getDescription(),
                    dep.getAdmins() != null ? dep.getAdmins().size() : 0
                ))
                .collect(Collectors.toList());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /chatbot/deleteDep/{id}
    // ─────────────────────────────────────────────────────────────────────────
    @DeleteMapping("/deleteDep/{id}")
    public ResponseEntity<String> delete(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            String role = jwtUtil.getRoleFromToken(token);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("{\"message\": \"Only admin can delete department\"}");
            }

            Optional<Department> optionalDepartment = departmentrepository.findById(id);
            if (optionalDepartment.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("{\"message\": \"Department not found\"}");
            }

            Department department = optionalDepartment.get();
            List<AdminRegister> admins = department.getAdmins();
            for (AdminRegister admin : admins) {
                admin.setDepartment(null);
            }
            adminregisterrepository.saveAll(admins);
            departmentrepository.deleteById(id);

            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body("{\"message\": \"Department deleted successfully\"}");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"An error occurred while deleting the department.\"}");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chatbot/getdep/{id}
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/getdep/{id}")
    public ResponseEntity<Department> getUserById(@PathVariable Long id) {
        Optional<Department> depOptional = departmentrepository.findById(id);
        if (depOptional.isPresent()) {
            return ResponseEntity.ok(depOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /chatbot/updatedepartment/{id}
    // Admin can freely reassign any agent to this department.
    // Old members are unlinked, new list applied — no conflict blocking.
    // ─────────────────────────────────────────────────────────────────────────
    @PatchMapping("/updatedepartment/{id}")
    public ResponseEntity<?> updateDepartment(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody DepartmentRequestDto departmentDTO) {
        try {
            String role = jwtUtil.getRoleFromToken(token);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("{\"message\": \"Only admin can update department\"}");
            }

            Optional<Department> optionalDepartment = departmentrepository.findById(id);
            if (optionalDepartment.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("{\"message\": \"Department not found\"}");
            }

            Department department = optionalDepartment.get();
            department.setDepName(departmentDTO.getDepName());
            department.setDescription(departmentDTO.getDescription());

            // Step 1: Unlink all current members from this department
            List<AdminRegister> oldAdmins = new ArrayList<>(department.getAdmins());
            for (AdminRegister oldAdmin : oldAdmins) {
                oldAdmin.setDepartment(null);
            }
            adminregisterrepository.saveAll(oldAdmins);

            // Step 2: Handle empty member list
            if (departmentDTO.getAdminIds() == null || departmentDTO.getAdminIds().isEmpty()) {
                department.setAdmins(new ArrayList<>());
                departmentrepository.save(department);
                return ResponseEntity.ok().body("{\"message\": \"Department updated with no members\"}");
            }

            // Step 3: Fetch new agents and assign them
            List<AdminRegister> newAdmins = adminregisterrepository.findAllById(departmentDTO.getAdminIds());
            if (newAdmins.isEmpty()) {
                return ResponseEntity.badRequest().body("No valid admins found for the provided IDs.");
            }

            // No conflict check — admin has full authority to move agents between departments.
            // If an agent was in another department, they are simply reassigned here.
            for (AdminRegister admin : newAdmins) {
                admin.setDepartment(department);
            }
            adminregisterrepository.saveAll(newAdmins);

            department.setAdmins(newAdmins);
            departmentrepository.save(department);

            return ResponseEntity.ok().body("{\"message\": \"Department updated successfully\"}");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Error while updating department\"}");
        }
    }
}