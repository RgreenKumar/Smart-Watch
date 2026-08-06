package  com.KnowledgeVista.Batch.Event;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

@Repository
@Transactional
public class EventRepositoryImpl implements EventRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Map<String, Object> getEventsByBatchIds(List<Long> batchIds, Long userId, int pageNumber, int pageSize) {
        int offset = (pageNumber - 1) * pageSize; // ✅ Correct Offset Calculation

        // ✅ Query to Get Paginated Data
        String sql = """
SELECT * FROM (
    -- Meetings
    SELECT 
        m.topic AS title, 
        m.meeting_id AS MeetingId, 
        NULL AS QuizzDate,    
        m.duration AS duration, 
        TO_TIMESTAMP(m.start_time, 'YYYY-MM-DD"T"HH24:MI:SS') AS startTime,
        b.batch_id AS batchString,
        'MEET' AS type,
        b.id AS batchid,
        b.batch_title AS batchName,
        NULL AS quizzid,
        NULL AS status
    FROM meeting m
    JOIN meeting_batch_mapping mbm ON m.pk_id = mbm.meeting_id
    JOIN batch b ON mbm.batch_id = b.id
    WHERE b.id IN (:batchIds)
    AND TO_DATE(m.start_time, 'YYYY-MM-DD') >= CURRENT_DATE 

    UNION ALL

    -- Quizzes with Attempt Status
    SELECT 
        q.quizz_name AS title,
        NULL AS MeetingId,
        qs.quizz_date AS QuizzDate,
        q.duration_in_minutes AS duration,
        NULL AS startTime,
        b.batch_id AS batchString,
        'QUIZZ' AS type,
        b.id AS batchid,
        b.batch_title AS batchName,
        q.quizz_id AS quizzid,
        CASE 
            WHEN COUNT(qa.attempt_id) > 0 THEN TRUE 
            ELSE FALSE 
        END AS status
    FROM quizz_schedule qs
    JOIN batch b ON qs.batch_id = b.id
    JOIN quizz q ON qs.quiz_id = q.quizz_id
    LEFT JOIN quiz_attempt qa ON qa.quiz_id = q.quizz_id AND qa.user_id = :userId
    WHERE b.id IN (:batchIds)
    AND qs.quizz_date >= CURRENT_DATE
    GROUP BY q.quizz_name, qs.quizz_date, q.duration_in_minutes, b.batch_id, b.id, b.batch_title, q.quizz_id

    UNION ALL

    -- Module Tests with Attempt Status
    SELECT 
        mt.mtest_name AS title,
        NULL AS MeetingId,
        smt.test_date AS QuizzDate, 
        NULL AS duration,
        NULL AS startTime,
        b.batch_id AS batchString,
        'MTEST' AS type,
        b.id AS batchid,
        b.batch_title AS batchName,
        mt.mtest_id AS quizzid,
        CASE 
            WHEN COUNT(mta.mactivity_id) > 0 THEN TRUE 
            ELSE FALSE 
        END AS status
    FROM shedule_module_test smt
    JOIN batch b ON smt.batch_id = b.id
    JOIN module_test mt ON smt.mtest_id = mt.mtest_id
    LEFT JOIN module_test_activity mta ON mta.mtest_id = mt.mtest_id AND mta.user_id = :userId
    WHERE b.id IN (:batchIds)
    AND smt.test_date >= CURRENT_DATE
    GROUP BY mt.mtest_name, smt.test_date, b.batch_id, b.id, b.batch_title, mt.mtest_id
) AS combined_results
ORDER BY 
    CASE 
        WHEN startTime IS NOT NULL THEN startTime 
        ELSE QuizzDate 
    END;

        """;

        Query query = entityManager.createNativeQuery(sql, "EventMapping");
        query.setParameter("batchIds", batchIds);
        query.setParameter("userId", userId); // ✅ Fix: Ensure userId is provided
        query.setFirstResult(offset);
        query.setMaxResults(pageSize);
        
        List<EventDTO> events = query.getResultList();

        // ✅ Query to Get Total Count
        String countSql = """
            SELECT COUNT(*) FROM (
                -- Meetings
                SELECT m.topic 
                FROM meeting m
                JOIN meeting_batch_mapping mbm ON m.pk_id = mbm.meeting_id
                JOIN batch b ON mbm.batch_id = b.id
                WHERE b.id IN (:batchIds)
                AND TO_DATE(m.start_time, 'YYYY-MM-DD') >= CURRENT_DATE 

                UNION ALL

                -- Quizzes
                SELECT q.quizz_name
                FROM quizz_schedule qs
                JOIN batch b ON qs.batch_id = b.id
                JOIN quizz q ON qs.quiz_id = q.quizz_id
                WHERE b.id IN (:batchIds)
                AND qs.quizz_date >= CURRENT_DATE

                UNION ALL

                -- Module Tests
                SELECT mt.mtest_name 
                FROM shedule_module_test smt
                JOIN batch b ON smt.batch_id = b.id
                JOIN module_test mt ON smt.mtest_id = mt.mtest_id
                WHERE b.id IN (:batchIds)
                AND smt.test_date >= CURRENT_DATE
            ) AS total_results
        """;

        Query countQuery = entityManager.createNativeQuery(countSql);
        countQuery.setParameter("batchIds", batchIds);
        Number totalCount = (Number) countQuery.getSingleResult();

        // ✅ Return both events & total count
        Map<String, Object> response = new HashMap<>();
        response.put("events", events);
        response.put("totalCount", totalCount.intValue());

        return response;
    }
}
