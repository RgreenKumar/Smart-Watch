package  com.KnowledgeVista.Batch.Assignment.Repo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Batch.Assignment.AssignmentSchedule;

@Repository
public interface AssignmentSheduleRepo extends JpaRepository<AssignmentSchedule, Long> {
	@Query("SELECT q FROM AssignmentSchedule q WHERE q.Assignment.id = :AssignmentId AND q.batch.id = :batchId")
	Optional<AssignmentSchedule> findByAssignmentIdAndBatchId(Long batchId, Long AssignmentId);

	@Query("SELECT q FROM AssignmentSchedule q WHERE  q.batch.id = :batchId")
	List<AssignmentSchedule> findByBatchId(Long batchId);

	@Query("SELECT q.AssignmentDate FROM AssignmentSchedule q WHERE q.Assignment.id = :AssignmentId AND q.batch.id = :batchId")
	LocalDate findSheduleDateByAssignmentIDAndbatchID(Long batchId, Long AssignmentId);
}
