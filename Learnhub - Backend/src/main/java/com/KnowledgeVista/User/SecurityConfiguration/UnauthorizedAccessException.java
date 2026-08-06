package  com.KnowledgeVista.User.SecurityConfiguration;


public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}
