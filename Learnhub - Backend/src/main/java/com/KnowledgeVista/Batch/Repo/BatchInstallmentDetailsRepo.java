package  com.KnowledgeVista.Batch.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Batch.BatchInstallmentdetails;

@Repository
public interface BatchInstallmentDetailsRepo extends JpaRepository<BatchInstallmentdetails,Long> {

}
