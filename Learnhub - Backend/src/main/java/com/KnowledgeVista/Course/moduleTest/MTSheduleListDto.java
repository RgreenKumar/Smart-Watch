package  com.KnowledgeVista.Course.moduleTest;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MTSheduleListDto {
	 private Long mtestId;
	 private String mtestName;
	 private LocalDate mtestDate;
	 
	public static class UserResult {
		  private String passFailStatus;
		    private Double attendancePercentage;

		    public UserResult(String passFailStatus, Double attendancePercentage) {
		        this.passFailStatus = passFailStatus;
		        this.attendancePercentage = attendancePercentage;
		    }

		    public String getPassFailStatus() {
		        return passFailStatus;
		    }

		    public Double getAttendancePercentage() {
		        return attendancePercentage;
		    }
	}
}
