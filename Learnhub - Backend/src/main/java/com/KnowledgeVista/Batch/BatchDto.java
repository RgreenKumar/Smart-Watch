package  com.KnowledgeVista.Batch;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import  com.KnowledgeVista.Batch.Batch.PaymentType;
import  com.KnowledgeVista.Course.CourseDetail;
import  com.KnowledgeVista.User.Muser;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BatchDto {
	private Long id;
	private String batchId;
	private String batchTitle;
	private LocalDate startDate;
	private LocalDate endDate;
	private String institutionName;
	private Long noOfSeats;
	private Long amount;
	private String courseNames; // For aggregated course names
	private String trainerNames; // For aggregated trainer names
	private List<CourseDto> courses;
	private List<TrainerDto> trainers;
	private List<String> course;
	private List<String> trainer;
	private byte[] batchImage;
	private PaymentType paytype;
	private String duration; // Add this for formatted duration
    // Constructor, getters and setters
	  public BatchDto(Batch batch) {
	        this.id = batch.getId();
	        this.batchId = batch.getBatchId();
	        this.batchTitle = batch.getBatchTitle();
	        this.startDate = batch.getStartDate();
	        this.endDate = batch.getEndDate();
	        this.batchImage = batch.getBatchImage();
	        this.institutionName = batch.getInstitutionName();
	        this.noOfSeats = batch.getNoOfSeats();
	        this.amount = batch.getAmount();
            this.paytype=batch.getPaytype();
	        // Extract course names
	        if (batch.getCourses() != null) {
	            this.course = batch.getCourses().stream()
	                    .map(CourseDetail::getCourseName)
	                    .collect(Collectors.toList());
	        } else {
	            this.course = new ArrayList<>(); // Initialize to avoid null
	        }


	        // Extract trainer usernames
	        if (batch.getTrainers() != null) {
	            this.trainer = batch.getTrainers().stream()
	                    .map(Muser::getUsername)
	                    .distinct() // Remove duplicates
	                    .collect(Collectors.toList());
	        } else {
	            this.trainers = new ArrayList<>();
	        }

	        // Extract user usernames
	       
	    }


    public String getDuration() {
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM"); // "MMM" for abbreviated month
        String startMonth = this.startDate.format(monthFormatter);
        String endMonth = this.endDate.format(monthFormatter);
        return startMonth + " to " + endMonth;
    }
	// Constructor matching the query
	public BatchDto(Long id, String batchId, String batchTitle, LocalDate startDate, LocalDate endDate,
			String institutionName, Long noOfSeats, Long amount, String courseNames, String trainerNames) {
		this.id = id;
		this.batchId = batchId;
		this.batchTitle = batchTitle;
		this.startDate = startDate;
		this.endDate = endDate;
		this.institutionName = institutionName;
		this.noOfSeats = noOfSeats;
		this.amount = amount;
		this.courseNames = courseNames;
		this.trainerNames = trainerNames;
	}

	public BatchDto(Long id, String batchId, String batchTitle, LocalDate startDate, LocalDate endDate,
			String institutionName, Long noOfSeats, Long amount, String courseNames, String trainerNames,
			byte[] batchImage,PaymentType paytype) {
		this.id = id;
		this.batchId = batchId;
		this.batchTitle = batchTitle;
		this.startDate = startDate;
		this.endDate = endDate;
		this.institutionName = institutionName;
		this.noOfSeats = noOfSeats;
		this.amount = amount;
		this.courseNames = courseNames;
		this.trainerNames = trainerNames;
		this.batchImage = batchImage;
		this.paytype=paytype;
	}
	public BatchDto(Long id, String batchId, String batchTitle, LocalDate startDate, LocalDate endDate,
			String institutionName, Long noOfSeats, Long amount, String courseNames, String trainerNames,
			List<CourseDto> courses, List<TrainerDto> trainers, byte[] batchImage, String duration) {
		super();
		this.id = id;
		this.batchId = batchId;
		this.batchTitle = batchTitle;
		this.startDate = startDate;
		this.endDate = endDate;
		this.institutionName = institutionName;
		this.noOfSeats = noOfSeats;
		this.amount = amount;
		this.courseNames = courseNames;
		this.trainerNames = trainerNames;
		this.courses = courses;
		this.trainers = trainers;
		this.batchImage = batchImage;
		this.duration = duration;
	}
}
