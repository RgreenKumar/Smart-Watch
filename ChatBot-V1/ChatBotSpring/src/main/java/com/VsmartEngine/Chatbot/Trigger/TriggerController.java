package com.VsmartEngine.Chatbot.Trigger;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
import org.springframework.web.bind.annotation.RequestParam;

import com.VsmartEngine.Chatbot.Departments.Department;
import com.VsmartEngine.Chatbot.Departments.DepartmentRepository;
import com.VsmartEngine.Chatbot.TokenGeneration.JwtUtil;

import jakarta.transaction.Transactional;


@CrossOrigin()
@RequestMapping("/chatbot")
@Controller
public class TriggerController {

    @Autowired
    private TriggerRepository triggerRepository;

    @Autowired
    private TriggerTypeRepository triggerTypeRepository;

    @Autowired
    private SetDepartmentRepository departmentRepository;

    @Autowired
    private DepartmentRepository departmentrepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/AddTrigger")
    public ResponseEntity<?> createTrigger(@RequestBody TriggerRequestDto request) {
        try {
            Triggertype triggerType = triggerTypeRepository.findById(request.getTriggerTypeId())
                    .orElseThrow(() -> new RuntimeException("Trigger type not found"));

            Trigger trigger = new Trigger();
            trigger.setName(request.getName());
            trigger.setDelay(request.getDelay());
            trigger.setTriggerType(triggerType);
            trigger.setStatus(false);
            trigger.setFirstTrigger(request.getFirstTrigger());

            if (request.getText() != null && !request.getText().isBlank()) {
                TextOption textOption = new TextOption();
                textOption.setText(request.getText());
                textOption.setTrigger(trigger);
                trigger.setTextOption(textOption);
            }

            if (request.getDepartmentIds() != null && !request.getDepartmentIds().isEmpty()) {
                List<SetDepartment> setDepartments = new ArrayList<>();
                for (Long deptId : request.getDepartmentIds()) {
                    Department dept = departmentrepository.findById(deptId)
                            .orElseThrow(() -> new RuntimeException("Department not found: " + deptId));

                    SetDepartment setDept = new SetDepartment();
                    setDept.setName(dept.getDepName());
                    setDept.setDepId(deptId);   // correctly set
                    setDept.setTrigger(trigger);
                    setDepartments.add(setDept);
                }
                trigger.setDepartments(setDepartments);
            }

            Trigger savedTrigger = triggerRepository.save(trigger);
            return ResponseEntity.ok(savedTrigger);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating trigger: " + e.getMessage());
        }
    }

    @Transactional
    @PostMapping("/UpdateTriggerStatus")
    public ResponseEntity<?> updateTriggerStatus(@RequestParam Long triggerId, @RequestParam boolean status) {
        try {
            Trigger trigger = triggerRepository.findById(triggerId)
                    .orElseThrow(() -> new RuntimeException("Trigger not found with ID: " + triggerId));

            if (status) {
                triggerRepository.updateAllStatusesToFalseExcept(triggerId);
            }

            trigger.setStatus(status);
            Trigger updatedTrigger = triggerRepository.save(trigger);
            return ResponseEntity.ok(updatedTrigger);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating trigger status: " + e.getMessage());
        }
    }

    @GetMapping("/getTriggerType")
    public ResponseEntity<List<Triggertype>> getTriggertype() {
        try {
            List<Triggertype> gettriggertype = triggerTypeRepository.findAll();
            if (gettriggertype.isEmpty()) {
                return new ResponseEntity(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(gettriggertype, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getAllTrigger")
    public ResponseEntity<List<Trigger>> getAllTrigger() {
        try {
            List<Trigger> gettrigger = triggerRepository.findAllByOrderByTriggeridAsc();
            if (gettrigger.isEmpty()) {
                return new ResponseEntity(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(gettrigger, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/gettrigger/{id}")
    public ResponseEntity<Trigger> geTriggerById(@PathVariable Long id) {
        Optional<Trigger> triggerOptional = triggerRepository.findById(id);
        if (triggerOptional.isPresent()) {
            return ResponseEntity.ok(triggerOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/getTrigger")
    public ResponseEntity<Trigger> getOneTriggerByType() {
        try {
            Optional<Trigger> trigger = triggerRepository.findByTriggerType_TriggerType("Basic");
            if (trigger.isPresent()) {
                return new ResponseEntity<>(trigger.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/deleteTrigger/{id}")
    public ResponseEntity<String> deleteTrigger(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            String role = jwtUtil.getRoleFromToken(token);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("{\"message\": \"Only admin can delete department\"}");
            }

            Optional<Trigger> triggerOpt = triggerRepository.findById(id);
            if (triggerOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("{\"message\": \"Trigger not found\"}");
            }

            triggerRepository.delete(triggerOpt.get());
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body("{\"message\": \"Trigger and its related data deleted successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"An error occurred while deleting the trigger.\"}");
        }
    }

    @PatchMapping("/UpdateTrigger/{id}")
    public ResponseEntity<?> updateTrigger(@PathVariable Long id, @RequestBody TriggerRequestDto request) {
        try {
            Trigger trigger = triggerRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Trigger not found with ID: " + id));

            trigger.setName(request.getName());
            trigger.setDelay(request.getDelay());

            Triggertype triggerType = triggerTypeRepository.findById(request.getTriggerTypeId())
                    .orElseThrow(() -> new RuntimeException("Trigger type not found"));
            trigger.setTriggerType(triggerType);
            trigger.setFirstTrigger(request.getFirstTrigger());

            if (request.getText() != null && !request.getText().isBlank()) {
                if (trigger.getTextOption() != null) {
                    trigger.getTextOption().setText(request.getText());
                } else {
                    TextOption textOption = new TextOption();
                    textOption.setText(request.getText());
                    textOption.setTrigger(trigger);
                    trigger.setTextOption(textOption);
                }
            } else {
                trigger.setTextOption(null);
            }

            // BUG FIX: was missing setDepId(deptId) — without it, SetDepartment.DepId
            // stays NULL after any trigger update. The widget then sends NaN as departmentId
            // to /api/chat/message, so resolveDept() falls back to the first department
            // (depart_two) instead of the user's chosen department (depart_3).
            // Fix: always set DepId, exactly like AddTrigger does.
            if (request.getDepartmentIds() != null) {
                trigger.getDepartments().clear();

                for (Long deptId : request.getDepartmentIds()) {
                    Department dept = departmentrepository.findById(deptId)
                            .orElseThrow(() -> new RuntimeException("Department not found: " + deptId));

                    SetDepartment setDept = new SetDepartment();
                    setDept.setName(dept.getDepName());
                    setDept.setDepId(deptId);   // ← THE FIX: was missing here
                    setDept.setTrigger(trigger);
                    trigger.getDepartments().add(setDept);
                }
            } else {
                trigger.getDepartments().clear();
            }

            Trigger updatedTrigger = triggerRepository.save(trigger);
            return ResponseEntity.ok(updatedTrigger);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating trigger: " + e.getMessage());
        }
    }
}