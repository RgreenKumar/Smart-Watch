package  com.KnowledgeVista.Meeting.zoomclass;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Occurrences {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long ocId;
	private Integer duration;
	private Long occurrence_id;
	private String start_time;
	private String status;
	 @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "meeting_id") // Foreign key column in Occurrences table
	    private Meeting meeting;
}
