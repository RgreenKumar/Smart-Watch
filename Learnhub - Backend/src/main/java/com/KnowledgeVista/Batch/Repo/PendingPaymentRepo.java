package  com.KnowledgeVista.Batch.Repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Batch.PendingPayments;

@Repository
public interface PendingPaymentRepo extends JpaRepository<PendingPayments, Long>{
	@Query("SELECT p FROM PendingPayments p WHERE p.email=:email")
	List<PendingPayments> findPendingPaymentsByemail(@Param("email") String email);

	@Query("SELECT p FROM PendingPayments p WHERE p.email = :email AND p.batchId = :batchId AND p.installmentNo = :installmentNo")
	Optional<PendingPayments> getPendingsByEmailAndBatchIdAndInstallmentId(@Param("email") String email, 
	                                             @Param("batchId") Long batchId, 
	                                             @Param("installmentNo") Long installmentNo);


}
