package  com.KnowledgeVista.User;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MuserAddInfoDto {
	private Long adminCount;
    private String institutionName;
    private String adminEmail;
    private boolean emailExists;
	@Override
	public String toString() {
		return "MuserAddInfoDto [adminCount=" + adminCount + ", institutionName=" + institutionName + ", adminEmail="
				+ adminEmail + ", emailExists=" + emailExists + "]";
	} 
}
