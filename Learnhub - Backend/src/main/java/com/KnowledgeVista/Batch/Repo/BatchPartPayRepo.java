package  com.KnowledgeVista.Batch.Repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Batch.Batch;
import  com.KnowledgeVista.Batch.BatchInstallmentDto;
import  com.KnowledgeVista.Batch.BatchInstallmentdetails;
import  com.KnowledgeVista.Batch.Batch_partPayment_Structure;

@Repository
public interface BatchPartPayRepo extends JpaRepository<Batch_partPayment_Structure, Long> {

	@Query("SELECT new  com.KnowledgeVista.Batch.BatchInstallmentDto(i.id, i.installmentNumber, i.installmentAmount, i.durationInDays) "
			+ "FROM BatchInstallmentdetails i " + "JOIN i.partpay p " + "JOIN p.batch b " + "WHERE b.id = :batchId")
	List<BatchInstallmentDto> findInstallmentDetailsByBatchId(@Param("batchId") Long batchId);

	@Query("SELECT i " + "FROM BatchInstallmentdetails i " + "JOIN i.partpay p " + "JOIN p.batch b "
			+ "WHERE b.id = :batchId")
	List<BatchInstallmentdetails> findoriginalInstallmentDetailsByBatchId(@Param("batchId") Long batchId);

	Optional<Batch_partPayment_Structure> findByBatch(Batch batch);

}
