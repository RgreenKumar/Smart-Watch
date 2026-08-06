package  com.KnowledgeVista.License;

import java.util.List;
import java.util.Map;

public class UserListWithStatus {


    private boolean isEmpty;
    private boolean valid;
    private boolean type;
    private List<Map<String, Object>> dataList;
    private String Productversion;
    public UserListWithStatus(boolean isEmpty, boolean valid, boolean type, List<Map<String, Object>> dataList,String Productversion) {
        this.isEmpty = isEmpty;
        this.valid = valid;
        this.type = type;
        this.dataList = dataList;
        this.Productversion=Productversion;
    }

	

    public String getProductversion() {
		return Productversion;
	}



	public void setProductversion(String productversion) {
		Productversion = productversion;
	}



	public boolean getType() {
		return type;
	}
    
    public List<Map<String, Object>> getDataList() {
        return dataList;
    }


	public void setType(boolean type) {
		this.type = type;
	}



	public boolean isEmpty() {
        return isEmpty;
    }

    public boolean isValid() {
        return valid;
    }
}
