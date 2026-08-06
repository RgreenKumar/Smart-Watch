package  com.KnowledgeVista.Course.certificate;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter@Setter@NoArgsConstructor
public class certificate {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	 private Long certificateId;
	 private String  InstitutionName;
	 private String OwnerName;
	 private String Qualification;
	 private String Address;
	 @Lob
	 @Column(length=1000000)
	 private byte[] AuthorizedSign;
	 
	 private String institution;
//	 @Lob
//	 @Column(length=1000000)
//	 private byte[] certificateTemplate;
}
