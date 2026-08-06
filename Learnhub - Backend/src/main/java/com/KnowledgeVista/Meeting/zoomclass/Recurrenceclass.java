package  com.KnowledgeVista.Meeting.zoomclass;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Recurrenceclass {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long recId;
	 private String endDateTime;
     private Integer endTimes;
     private Integer monthlyDay;
     private Integer monthlyWeek;
     private Integer monthlyWeekDay;
     private Integer repeatInterval;
     private Integer type;
     private String weeklyDays;
}
