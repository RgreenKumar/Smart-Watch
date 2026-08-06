package  com.KnowledgeVista.Payments.repos;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Payments.Payment_Type;

@Repository
public interface PaymentTypeRepo extends JpaRepository<Payment_Type, Long>{

	@Query("SELECT pt.isActive FROM Payment_Type pt WHERE pt.institutionName=:institutionName AND pt.paymentTypeName=:typeName  ")
	Boolean findisActivebyinstitutionNameAndTypeName(String institutionName,String typeName);
	
	@Query("SELECT pt FROM Payment_Type pt WHERE pt.institutionName=:institutionName AND pt.paymentTypeName=:typeName  ")
	Optional<Payment_Type> findPaymentTypeinstitutionNameAndTypeName(String institutionName,String typeName);
	
	@Query("SELECT p.paymentTypeName AS name, p.isActive AS active " +
		       "FROM Payment_Type p WHERE p.institutionName = :institutionName")
		List<Map<String, Object>> findByInstitutionNameAsMap(@Param("institutionName") String institutionName);

}
