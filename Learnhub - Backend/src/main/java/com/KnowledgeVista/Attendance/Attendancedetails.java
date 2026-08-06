package  com.KnowledgeVista.Attendance;


import java.time.LocalDate;

import  com.KnowledgeVista.Meeting.zoomclass.Meeting;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity@Getter@Setter@NoArgsConstructor
@Table(
uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "date", "meeting_id"}))
public class Attendancedetails {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id; 
	    private Long userId;
	    private LocalDate date;
	    private String status; //PRESENT or ABSENT
	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "meeting_id")  // Foreign Key
	    private Meeting meeting;
}
