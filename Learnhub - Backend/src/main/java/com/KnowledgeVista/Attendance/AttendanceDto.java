package  com.KnowledgeVista.Attendance;

import java.time.LocalDate;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class AttendanceDto {

    private String topic;
   private Long id;
   private LocalDate date;
   private String status;
public AttendanceDto(String topic, Long id, LocalDate date, String status) {
	super();
	this.topic = topic;
	this.id = id;
	this.date = date;
	this.status = status;
}
}
