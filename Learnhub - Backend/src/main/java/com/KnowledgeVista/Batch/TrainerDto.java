package  com.KnowledgeVista.Batch;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TrainerDto {
	 private Long userId;
	    private String username;

	    public TrainerDto(Long userId, String username) {
	        this.userId = userId;
	        this.username = username;
	    }

}
