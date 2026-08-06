package  com.KnowledgeVista.Meeting.zoomclass;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class VirtualmeetingMap {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long pkId;

	    @Column(nullable = false, unique = true)
	    private String institutionName;

	    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
	    @JoinColumn(name = "meeting_id", unique = true)
	    private Meeting meeting;
}
