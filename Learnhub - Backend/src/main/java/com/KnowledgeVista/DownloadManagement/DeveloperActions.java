package  com.KnowledgeVista.DownloadManagement;


import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/Developer")
public class DeveloperActions {
	
	    
	    @Autowired
	    private CustomerdownloadRepo customerdownloadRepo;
	    
	    @Autowired
	    private CustomerLeadsRepo customerleadRepo;
	    
	  	 private static final Logger logger = LoggerFactory.getLogger(DeveloperActions.class);

	   
	 @PostMapping("/CustomerDownloads")
	    public ResponseEntity<?> saveCustomerDownloads(@RequestBody Customer_downloads customerdownloads) {
	        try {
	            

	            Customer_downloads custDown = new Customer_downloads();
	            custDown.setName(customerdownloads.getName());
	            custDown.setEmail(customerdownloads.getEmail());
	            custDown.setCountryCode(customerdownloads.getCountryCode());
	            custDown.setPhone(customerdownloads.getPhone());
	            custDown.setDescription(customerdownloads.getDescription());
	            custDown.setVersion(customerdownloads.getVersion());
	            custDown.setCourseCount(customerdownloads.getCourseCount());
	            custDown.setTrainerCount(customerdownloads.getTrainerCount());
	            custDown.setStudentCount(customerdownloads.getStudentCount());

	            customerdownloadRepo.save(custDown);

	            return ResponseEntity.ok().body("Saved Successfully");

	        } catch (Exception e) {
	            // Log any other exceptions for debugging purposes
	            e.printStackTrace();    logger.error("", e);; // You can replace this with logging framework like Log4j
	            // Return an internal server error response
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	        }
	    }
	 @PutMapping("/CustomerDownload/{email}")
	 public ResponseEntity<?> updateCustomerDownloadFully(@PathVariable String email, @RequestBody Customer_downloads customerDownload) {
	      try {
	         // Check if customer lead exists
	        Optional< Customer_downloads>opexistingDownload = customerdownloadRepo.findByEmail(email);
	        if(opexistingDownload.isPresent()) {
	        	Customer_downloads existingdownloads=opexistingDownload.get();
	        	 // Update only the fields with values provided in the request body
	            if (customerDownload.getName() != null) existingdownloads.setName(customerDownload.getName());
	            if (customerDownload.getEmail() != null) existingdownloads.setEmail(customerDownload.getEmail());
	            if (customerDownload.getCountryCode() != null) existingdownloads.setCountryCode(customerDownload.getCountryCode());
	            if (customerDownload.getPhone() != null) existingdownloads.setPhone(customerDownload.getPhone());
	            if (customerDownload.getDescription() != null) existingdownloads.setDescription(customerDownload.getDescription());
	            if (customerDownload.getVersion() != null) existingdownloads.setVersion(customerDownload.getVersion());
	            if (customerDownload.getCourseCount() != null) existingdownloads.setCourseCount(customerDownload.getCourseCount());
	            if (customerDownload.getTrainerCount() != null) existingdownloads.setTrainerCount(customerDownload.getTrainerCount());
	            if (customerDownload.getStudentCount() != null) existingdownloads.setStudentCount(customerDownload.getStudentCount());
	            

	         customerdownloadRepo.save(existingdownloads);
	        }else{
	        	customerdownloadRepo.save(customerDownload);
	        }

	         return ResponseEntity.ok().body("Partially Updated");

	     } catch (Exception e) {
	         // Log any other exceptions for debugging purposes
	         e.printStackTrace();    logger.error("", e);;
	         // Return an internal server error response
	         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	     }
	 }	

	 @GetMapping("/getCustomerDownloads")
	    public ResponseEntity<List< Customer_downloads>> getCustomerdownloads() {
	        try {
	            List< Customer_downloads> customerdownloads = customerdownloadRepo.findAll();
	            return ResponseEntity.ok(customerdownloads);
	        } catch (Exception e) {
	            // Log any other exceptions for debugging purposes
	            e.printStackTrace();    logger.error("", e);; // You can replace this with logging framework like Log4j
	            // Return an internal server error response
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	        }
	    }
	 
	
	 @DeleteMapping("/Customerdownload")
	    public ResponseEntity<?> deleteCustomerdownload(@RequestParam("id") Long id) {
	        try {
	            if (customerdownloadRepo.existsById(id)) {
	            	customerdownloadRepo.deleteById(id);
	                return ResponseEntity.ok().body("Deleted Successfully");
	            } else {
	                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
	            }
	        } catch (Exception e) {
	            // Log any other exceptions for debugging purposes
	            e.printStackTrace();    logger.error("", e);; // You can replace this with a logging framework like Log4j
	            // Return an internal server error response
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	        }
	    }
	 
	 //------------------CustomerLeads---------------------

	 @PostMapping("/CustomerLeads")
	    public ResponseEntity<?> saveCustomerleads(@RequestBody CustomerLeads customerLeads) {
	        try {
	            CustomerLeads custLead = new CustomerLeads();
	            custLead.setName(customerLeads.getName());
	            custLead.setEmail(customerLeads.getEmail());
	            custLead.setCountryCode(customerLeads.getCountryCode());
	            custLead.setPhone(customerLeads.getPhone());
	            custLead.setDescription(customerLeads.getDescription());
	            custLead.setVersion(customerLeads.getVersion());
	            custLead.setCourseCount(customerLeads.getCourseCount());
	            custLead.setTrainerCount(customerLeads.getTrainerCount());
	            custLead.setStudentCount(customerLeads.getStudentCount());
	            custLead.setLicenseType(customerLeads.getLicenseType());
	            custLead.setLicenseValidity(customerLeads.getLicenseValidity());
	            custLead.setIsLicenseExpired(customerLeads.getIsLicenseExpired());
                custLead.setLicenseKey(customerLeads.getLicenseKey());
                custLead.setLicencestartdate(customerLeads.getLicencestartdate());
                custLead.setLicenceEndDate(customerLeads.getLicenceEndDate());

	            customerleadRepo.save(custLead);

	            return ResponseEntity.ok().body("Saved Successfully");

	        } catch (Exception e) {
	            // Log any other exceptions for debugging purposes
	            e.printStackTrace();    logger.error("", e);; // You can replace this with logging framework like Log4j
	            // Return an internal server error response
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	        }
	    }
	 
	 @PutMapping("/CustomerLeads/{email}")
	 public ResponseEntity<?> updateCustomerLeadFully(@PathVariable String email, @RequestBody CustomerLeads customerLeads) {
	      try {
	         // Check if customer lead exists
	        Optional< CustomerLeads>opexistingLead = customerleadRepo.findByEmail(email);
	        if(opexistingLead.isPresent()) {
	        	CustomerLeads existingLead=opexistingLead.get();
	        	 // Update only the fields with values provided in the request body
	            if (customerLeads.getName() != null) existingLead.setName(customerLeads.getName());
	            if (customerLeads.getEmail() != null) existingLead.setEmail(customerLeads.getEmail());
	            if (customerLeads.getCountryCode() != null) existingLead.setCountryCode(customerLeads.getCountryCode());
	            if (customerLeads.getPhone() != null) existingLead.setPhone(customerLeads.getPhone());
	            if (customerLeads.getDescription() != null) existingLead.setDescription(customerLeads.getDescription());
	            if (customerLeads.getVersion() != null) existingLead.setVersion(customerLeads.getVersion());
	            if (customerLeads.getCourseCount() != null) existingLead.setCourseCount(customerLeads.getCourseCount());
	            if (customerLeads.getTrainerCount() != null) existingLead.setTrainerCount(customerLeads.getTrainerCount());
	            if (customerLeads.getStudentCount() != null) existingLead.setStudentCount(customerLeads.getStudentCount());
	            if (customerLeads.getLicenseType() != null) existingLead.setLicenseType(customerLeads.getLicenseType());
	            if (customerLeads.getLicenseValidity() != null) existingLead.setLicenseValidity(customerLeads.getLicenseValidity());
	            if (customerLeads.getIsLicenseExpired() != null) existingLead.setIsLicenseExpired(customerLeads.getIsLicenseExpired());
	            if (customerLeads.getLicenseKey() != null) existingLead.setLicenseKey(customerLeads.getLicenseKey());
	            if(customerLeads.getLicencestartdate()!=null)existingLead.setLicencestartdate(customerLeads.getLicencestartdate());
	            if(customerLeads.getLicenceEndDate()!=null)existingLead.setLicenceEndDate(customerLeads.getLicenceEndDate());


	         customerleadRepo.save(existingLead);
	        }else{
	        	customerleadRepo.save(customerLeads);
	        }

	         return ResponseEntity.ok().body("Partially Updated");

	     } catch (Exception e) {
	         // Log any other exceptions for debugging purposes
	         e.printStackTrace();    logger.error("", e);;
	         // Return an internal server error response
	         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	     }
	 }	 
	
	 
	 @GetMapping("/CustomerLeads")
	    public ResponseEntity<List<CustomerLeads>> getCustomerleads() {
	        try {
	            List<CustomerLeads> customerLeads = customerleadRepo.findAll();
	            return ResponseEntity.ok(customerLeads);
	        } catch (Exception e) {
	            // Log any other exceptions for debugging purposes
	            e.printStackTrace();    logger.error("", e);; // You can replace this with logging framework like Log4j
	            // Return an internal server error response
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	        }
	    }
	 
	 @DeleteMapping("/Customerlead")
	    public ResponseEntity<?> deleteCustomerlead(@RequestParam("id") Long id) {
	        try {
	            if (customerleadRepo.existsById(id)) {
	                customerleadRepo.deleteById(id);
	                return ResponseEntity.ok().body("Deleted Successfully");
	            } else {
	                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
	            }
	        } catch (Exception e) {
	            // Log any other exceptions for debugging purposes
	            e.printStackTrace();    logger.error("", e);; // You can replace this with a logging framework like Log4j
	            // Return an internal server error response
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	        }
	    }
}

