package  com.KnowledgeVista.Batch;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BatchInstallmentDtoWrapper {
    private Long batchId;
    private String batchTitle;
    private Long batchAmount;
    private List<BatchInstallmentDto> batchInstallments;
}
