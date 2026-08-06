package  com.KnowledgeVista.zoomJar;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
@Configuration
public class ZoomMethods {
	 private static final Logger logger = LoggerFactory.getLogger(ZoomMethods.class);
	private OkHttpClient client = new OkHttpClient();
	
	public String getAccessToken(String clientID, String clientSecret, String accountId) {
	    RestTemplate restTemplate = new RestTemplate();
	    HttpHeaders headers = new HttpHeaders();
	    
	    // Encode Client ID and Client Secret
	    String credentials = clientID + ":" + clientSecret;
	    String base64Credentials = Base64.getEncoder().encodeToString(credentials.getBytes());

	    // Set the Authorization header
	    headers.set("Authorization", "Basic " + base64Credentials);
	    headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);


	    // Prepare the request
	    HttpEntity<String> request = new HttpEntity<>(headers);

	    String tokenUrl = "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" + accountId;

	    try {
	        // Send the request and parse the response
	        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(tokenUrl, HttpMethod.POST, request, new ParameterizedTypeReference<Map<String, Object>>() {});

	        // Handle the response
	        Map<String, Object> responseBody = response.getBody();
	        if (responseBody != null && responseBody.containsKey("access_token")) {
	            return (String) responseBody.get("access_token");
	        } else {
	            // Log an error or throw an exception if the access token is not present
	            System.err.println("Access token not found in response.");
	            return null;
	        }
	    } catch (RestClientException e) {
	        // Log or handle the exception
	    	e.printStackTrace();
	    	logger.error("", e);
	        System.err.println("Error retrieving access token: " + e.getMessage());
	        return null;
	    }
	}
	

	    public String createMeeting(String json, String accessToken) throws IOException {
	        String ZOOM_API_URL = "https://api.zoom.us/v2/users/me/meetings";

	        // Create the request body with the provided JSON
	        RequestBody body = RequestBody.create(json,MediaType.get("application/json"));

	        // Build the request with authorization and content-type headers
	        Request request = new Request.Builder()
	                .url(ZOOM_API_URL)
	                .post(body)
	                .addHeader("Authorization", "Bearer " + accessToken)
	                .addHeader("Content-Type", "application/json")
	                .build();

	        // Execute the request and handle the response
	        try (Response response = client.newCall(request).execute()) {
	            if (response.isSuccessful()) {
	                // If successful, return the response body as a string
	                return response.body().string();
	            } else {
	                // If not successful, handle the error response
	                String errorResponse = response.body().string();
	                throw new IOException("Failed to create meeting: " + response.code() + " - " + response.message() + " - " + errorResponse);
	            }
	        } catch (Exception e) {
	            e.printStackTrace();
	            logger.error("", e);
	            throw new IOException("Failed to create Zoom meeting", e);
	        }
	    }
	    
	    public String getMeetingDetails(Long meetingId, String accessToken) throws IOException {
	        String ZOOM_API_URL = "https://api.zoom.us/v2/meetings/" + meetingId;

	        // Build the request with authorization and content-type headers
	        Request request = new Request.Builder()
	                .url(ZOOM_API_URL)
	                .get() // This is a GET request to fetch meeting details
	                .addHeader("Authorization", "Bearer " + accessToken)
	                .addHeader("Content-Type", "application/json")
	                .build();

	        // Execute the request and handle the response
	        try (Response response = client.newCall(request).execute()) {
	            if (response.isSuccessful()) {
	                // If successful, return the response body as a string
	                return response.body().string();
	            } else {
	                // If not successful, handle the error response
	                String errorResponse = response.body().string();
	                throw new IOException("Failed to get meeting details: " + response.code() + " - " + response.message() + " - " + errorResponse);
	            }
	        } catch (Exception e) {
	            e.printStackTrace();
	            logger.error("", e);
	            throw new IOException("Failed to get Zoom meeting details", e);
	        }
	    } 
	    public String EditMeet(Long meetingId, String json, String accessToken) throws IOException {
	        // Construct the URL for the Zoom API request
	        String url = "https://api.zoom.us/v2/meetings/" + meetingId;

	        // Create the request body from the JSON string
	        RequestBody body = RequestBody.create(json, MediaType.get("application/json"));

	        // Build the PATCH request to update the meeting
	        Request request = new Request.Builder()
	                .url(url)
	                .patch(body)  // Use PATCH for updates
	                .addHeader("Authorization", "Bearer " + accessToken)
	                .addHeader("Content-Type", "application/json")
	                .build();

	        try (Response response = client.newCall(request).execute()) {
	            if (response.isSuccessful()) {
	                // If the update was successful, send a GET request to retrieve the updated meeting details
	                Request getRequest = new Request.Builder()
	                        .url(url)
	                        .get()  
	                        .addHeader("Authorization", "Bearer " + accessToken)
	                        .addHeader("Content-Type", "application/json")
	                        .build();

	                try (Response response2 = client.newCall(getRequest).execute()) {
	                    if (response2.isSuccessful()) {
	                        String res = response2.body().string();
	                        return res;
	                    } else {
	                       return response2.body().string();
	                    }
	                }
	            } else {
	                String errorResponse = response.body().string();
	                System.out.println("Error updating meeting: " + errorResponse);
	                return errorResponse;
	            }
	        }
	    }  
	        public boolean deleteMeeting(Long meetingId, String accessToken) throws IOException {
	            String deleteUrl = "https://api.zoom.us/v2/meetings/" + meetingId;

	            // Create the HTTP DELETE request
	            Request request = new Request.Builder()
	                    .url(deleteUrl)
	                    .delete()
	                    .addHeader("Authorization", "Bearer " + accessToken)
	                    .build();

	            // Execute the request
	            try (Response response = client.newCall(request).execute()) {
	                if (response.isSuccessful()) {
	                    // Successfully deleted from Zoom
	                    return true;
	                } else if (response.code() == 404) {
	                    // Meeting not found, consider it successfully deleted or handle as needed
	                    return true;
	                } else {
	                    // Handle error response
	                    String errorResponse = response.body().string();
	                    System.err.println("Error deleting meeting: " + errorResponse);
	                    throw new IOException("Error deleting meeting: " + errorResponse);
	                }
	            }
	        }

}
