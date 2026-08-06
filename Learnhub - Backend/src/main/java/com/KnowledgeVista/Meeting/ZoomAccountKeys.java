package  com.KnowledgeVista.Meeting;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table
@Getter@Setter@NoArgsConstructor
public class ZoomAccountKeys {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
	private String client_id;
	private String client_secret;
	private String account_id;
	@Column(unique = true)
	private String institution_name;
}
