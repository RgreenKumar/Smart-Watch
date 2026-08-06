package  com.KnowledgeVista.Batch.Event;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository {
	@Query(value = "SELECT * FROM event_table WHERE batch_id IN (:batchIds) ORDER BY quizz_date", nativeQuery = true)
	 Map<String, Object> getEventsByBatchIds(@Param("batchIds") List<Long> batchIds,Long userId,int pageNumber,int pageSize);

}

