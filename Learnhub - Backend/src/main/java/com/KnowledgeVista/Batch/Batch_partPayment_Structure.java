package  com.KnowledgeVista.Batch;

import java.time.LocalDate;
import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity@Table
@Getter@Setter
@NoArgsConstructor
public class Batch_partPayment_Structure {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long batchPartayId; 
	
	@OneToOne  // ✅ Change ManyToOne to OneToOne
    @JoinColumn(name = "batch_id", referencedColumnName = "id", unique = true) // ✅ Ensure uniqueness
    private Batch batch;
	
	private LocalDate datecreated;
	private String createdBy;
	private String ApprovedBy;
	
	@Column(columnDefinition ="Varchar(100)")
	private String ReferalCode;
	
	 @OneToMany(mappedBy = "partpay", cascade = CascadeType.REMOVE)
	private List<BatchInstallmentdetails> installmentDetail;
}
