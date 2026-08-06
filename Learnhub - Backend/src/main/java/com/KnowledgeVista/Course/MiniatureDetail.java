package  com.KnowledgeVista.Course;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Lob;

@Embeddable
public class MiniatureDetail {

    // Store the miniature image as a byte array
    @Lob
    private byte[] miniatureContent;

    // Store the page number
    private int pageNumber;

    // Constructors, Getters, Setters
    public MiniatureDetail() {}

    public MiniatureDetail(byte[] miniatureContent, int pageNumber) {
        this.miniatureContent = miniatureContent;
        this.pageNumber = pageNumber;
    }

    public byte[] getMiniatureContent() {
        return miniatureContent;
    }

    public void setMiniatureContent(byte[] miniatureContent) {
        this.miniatureContent = miniatureContent;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }
}

