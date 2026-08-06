package  com.KnowledgeVista.Batch;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BatchInstallmentDto {
	  private Long id;
	    private Long installmentNumber;  
	    private Long installmentAmount;  
	    private Long durationInDays;
		public BatchInstallmentDto(Long id, Long installmentNumber, Long installmentAmount, Long durationInDays) {
			super();
			this.id = id;
			this.installmentNumber = installmentNumber;
			this.installmentAmount = installmentAmount;
			this.durationInDays = durationInDays;
		} 
	    
	    
}
