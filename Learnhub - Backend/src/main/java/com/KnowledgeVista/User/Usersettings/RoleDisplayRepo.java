package  com.KnowledgeVista.User.Usersettings;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RoleDisplayRepo extends JpaRepository<Role_display_name,Long> {
	@Query("SELECT r FROM Role_display_name r WHERE r.insitution=?1 ")
	Optional<Role_display_name> getdisplayname(String insitution);
	
	
}
