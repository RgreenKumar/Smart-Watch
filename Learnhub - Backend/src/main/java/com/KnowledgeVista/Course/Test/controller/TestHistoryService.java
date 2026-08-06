package  com.KnowledgeVista.Course.Test.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import  com.KnowledgeVista.Course.Test.TestHistoryDto;
import  com.KnowledgeVista.Course.Test.Repository.ViewRepository;

@Service
public class TestHistoryService {

    @Autowired
    private ViewRepository viewRepository;

    public Page<TestHistoryDto> getTestHistory(String email, List<Long> testIds, List<Long> mtestIds, Pageable pageable) {
        Page<Object[]> results = viewRepository.getTestHistory(email, testIds, mtestIds, pageable);

        return results.map(obj -> new TestHistoryDto(
            (String) obj[0],                  // courseName
            ((Number) obj[1]).longValue(),    // courseId
            (String) obj[2],                  // testName
            ((Number) obj[3]).longValue(),    // testId
            ((java.sql.Date) obj[4]).toLocalDate(), // testDate
            ((Number) obj[5]).longValue(),    // nthAttempt
            ((Number) obj[6]).doubleValue(),  // percentage
            (String) obj[7],                  // status
            (String) obj[8]                   // type
        ));
    }
}

