package  com.KnowledgeVista.Batch;

import java.time.LocalDate;

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
public class PendingPayments {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id; 
	    private Long batchId;
	    private String batchName;
	    private Long installmentNo;
	    private Long installmentId;
	    private String bId;
	    private Long amount;
	    private LocalDate lastDate;
	    private String email;
		@Override
		public String toString() {
			return "PendingPayments [id=" + id + ", batchId=" + batchId + ", batchName=" + batchName
					+ ", installmentNo=" + installmentNo + ", installmentId=" + installmentId + ", bId=" + bId
					+ ", amount=" + amount + ", lastDate=" + lastDate + ", email=" + email + "]";
		}
	    
}
