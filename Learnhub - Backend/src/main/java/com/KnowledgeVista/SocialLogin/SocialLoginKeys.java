package  com.KnowledgeVista.SocialLogin;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter@Setter@NoArgsConstructor
@Table(uniqueConstraints = {
	    @UniqueConstraint(columnNames = {"provider", "institutionName"})
	})
public class SocialLoginKeys {
	  @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    @Column
	    private Long id;
	  @Column(name = "provider")
	    private String provider;

	    @Column(name = "institutionName")
	    private String institutionName;
	   private String clientid;
	   private String clientSecret;
	   private String RedirectUrl;
	   
	   
}
