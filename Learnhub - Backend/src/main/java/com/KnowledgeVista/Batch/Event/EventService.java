package  com.KnowledgeVista.Batch.Event;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EventService {
    @Autowired
    private EventRepository eventRepository;

    public Map<String, Object> getEventsForBatch(List<Long> batchId,Long userId,int pageNumber,int pageSize) {
        return eventRepository.getEventsByBatchIds(batchId,userId,pageNumber,pageSize);
    }
}

