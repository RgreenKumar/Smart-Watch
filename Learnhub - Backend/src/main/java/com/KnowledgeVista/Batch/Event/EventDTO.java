package  com.KnowledgeVista.Batch.Event;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
public class EventDTO {
private String title;
private Long MeetingId;
private LocalDate QuizzDate;
private Integer duration;
private LocalDateTime startTime;
private String batchString;
private String type; 
private Long batchid;
private String batchName;
private Long quizzid;
private boolean status;

public EventDTO(String title, Long MeetingId, LocalDate QuizzDate,
        Integer duration, LocalDateTime startTime, String batchString, String type,Long batchid,String batchName,Long quizzid, boolean status
) {
this.title = title;
this.MeetingId = MeetingId;
this.QuizzDate=QuizzDate;
this.duration = duration;
this.startTime = startTime;
this.batchString = batchString;
this.type = type;
this.batchid=batchid;
this.batchName=batchName;
this.quizzid=quizzid;
this.status=status;
}
}

