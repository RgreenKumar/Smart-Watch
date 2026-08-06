package  com.KnowledgeVista.Meeting;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import  com.KnowledgeVista.zoomJar.ZoomMethods;
@Service
public class ZoomTokenService {
	@Autowired
		private ZoomAccountkeyrepo zoomacrepo;
		 @Autowired
		 private ZoomMethods zoomMethod;
		 
	   	 private static final Logger logger = LoggerFactory.getLogger(ZoomTokenService.class);

	    public ZoomAccountKeys getZoomAccounts(String institution) {
        	Optional<ZoomAccountKeys> opAccountdetails= zoomacrepo.findbyInstitutionName(institution);
        	if(opAccountdetails.isPresent()) {
        		ZoomAccountKeys Accountdetails=opAccountdetails.get();
        		return Accountdetails;
        	}else {
        		Optional<ZoomAccountKeys> opdefaultkeys=zoomacrepo.findbyInstitutionName("SYSADMIN");
        		if(opdefaultkeys.isPresent()) {
        			ZoomAccountKeys ZoomDefaultKeys =opdefaultkeys.get();
        			return ZoomDefaultKeys;
        		}else {
        			return null;
        		}
        	}
        }
	    public String getAccessToken(String institution) {
	    	try {
            ZoomAccountKeys zoomkeys=this.getZoomAccounts(institution);
            if (zoomkeys == null) {
                return null;
            }
            String CLIENT_ID = zoomkeys.getClient_id();
    	     String CLIENT_SECRET = zoomkeys.getClient_secret();
    	     String ACCOUNT_ID = zoomkeys.getAccount_id();
    	     return zoomMethod.getAccessToken(CLIENT_ID,CLIENT_SECRET,ACCOUNT_ID);
	    }catch(Exception e) {
	    e.printStackTrace();    logger.error("", e);;
	    return null;
	    }
	    }
}



