package  com.KnowledgeVista.Batch.Assignment;

import java.time.LocalDate;

import  com.KnowledgeVista.Batch.Batch;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(uniqueConstraints = @UniqueConstraint(columnNames = { "batch_id", "assignment_id" }))
@NoArgsConstructor
public class AssignmentSchedule {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long scheduleId;
	@ManyToOne
	@JoinColumn(name = "assignment_id", nullable = false)
	private Assignment Assignment;

	@ManyToOne
	@JoinColumn(name = "batch_id", nullable = false)
	private Batch batch;
	@Column(nullable = false)
	private LocalDate AssignmentDate;
}
