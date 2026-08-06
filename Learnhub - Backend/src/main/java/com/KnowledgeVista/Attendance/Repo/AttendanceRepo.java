package  com.KnowledgeVista.Attendance.Repo;


import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import  com.KnowledgeVista.Attendance.AttendanceDto;
import  com.KnowledgeVista.Attendance.Attendancedetails;

@Repository
public interface AttendanceRepo extends JpaRepository<Attendancedetails, Long> {
	
	 @Query("SELECT a.userId FROM Attendancedetails a WHERE a.meeting.MeetingId = :meetingId AND a.status = 'PRESENT' AND a.date=:date")
	    List<Long> finduserIdsByMeetingIdAndPRESENT(@Param("meetingId") Long meetingId,@Param("date") LocalDate date);
	 
	 @Query("""
			    SELECT COUNT(a) 
			    FROM Attendancedetails a 
			    JOIN a.meeting m
			    JOIN m.batches b
			    WHERE a.userId = :userId 
			    AND b.id = :batchId
			""")
			Long countClassesForUserAndBatch(@Param("userId") Long userId, @Param("batchId") Long batchId);

	 @Query("""
			    SELECT COUNT(a) 
			    FROM Attendancedetails a 
			    JOIN a.meeting m
			    JOIN m.batches b
			    WHERE a.userId = :userId 
			    AND b.id = :batchId
			    AND a.status='PRESENT'
			""")
			Long countClassesPresentForUser(@Param("userId") Long userId, @Param("batchId") Long batchId);
	
	 @Query("""
		        SELECT new  com.KnowledgeVista.Attendance.AttendanceDto(m.topic, a.id, a.date, a.status) 
		        FROM Attendancedetails a
		        JOIN a.meeting m
		        JOIN m.batches b
		        WHERE a.userId = :userId
		          AND b.id = :batchId
		        """)
		Page<AttendanceDto> findAttendanceByUserId(@Param("userId") Long userId,@Param("batchId") Long batchId, Pageable pageable);


	 
		    @Query("""
		            SELECT a FROM Attendancedetails a 
		            WHERE a.userId = :userId 
		              AND a.meeting.MeetingId = :meetingId 
		              AND a.date = :date
		        """)
		        Optional<Attendancedetails> findByUserIdAndMeetingIdAndDate(
		            @Param("userId") Long userId, 
		            @Param("meetingId") Long meetingId, 
		            @Param("date") LocalDate date
		        );

		  
}
