package  com.KnowledgeVista.Meeting;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
public class UserMeetingMap {
	
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long MeetingMapId;
	private Long userid;
	private Long MeetingTypeId;
	private Boolean isActive;
	

}
